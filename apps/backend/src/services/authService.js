const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const jwtUtils = require('../utils/jwt');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const loadUsers = () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((user) => ({
        ...user,
        id: Number(user.id),
      }));
    }
  } catch (error) {
    console.error('Falha ao carregar utilizadores:', error);
  }
  return [];
};

const saveUsers = (data) => {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Falha ao guardar utilizadores:', error);
  }
};

let users = loadUsers();

const nextUserId = () => {
  if (!users.length) return 1;
  return Math.max(...users.map((user) => Number(user.id) || 0)) + 1;
};

const normaliseEmail = (email) => String(email || '').trim().toLowerCase();
const normaliseName = (name) => String(name || '').trim();

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(String(password), salt, 100_000, 64, 'sha512');
  return `${salt}:${derived.toString('hex')}`;
};

const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const derived = crypto.pbkdf2Sync(String(password), salt, 100_000, 64, 'sha512');
  const derivedBuffer = derived;
  const hashBuffer = Buffer.from(hash, 'hex');
  if (derivedBuffer.length !== hashBuffer.length) return false;
  return crypto.timingSafeEqual(derivedBuffer, hashBuffer);
};

exports.register = async ({ name, email, password }) => {
  const cleanedName = normaliseName(name);
  const cleanedEmail = normaliseEmail(email);
  const cleanedPassword = String(password || '').trim();

  if (!cleanedName || !cleanedEmail || !cleanedPassword) {
    // eslint-disable-next-line no-console
    console.warn('[authService] Registo inválido', { cleanedName, cleanedEmail, hasPassword: !!cleanedPassword });
    throw new Error('Nome, email e palavra-passe são obrigatórios.');
  }

  if (cleanedPassword.length < 6) {
    throw new Error('A palavra-passe deve ter pelo menos 6 caracteres.');
  }

  const existingUser = users.find((user) => user.email === cleanedEmail);
  if (existingUser) {
    // eslint-disable-next-line no-console
    console.warn('[authService] Email já registado tentativa:', cleanedEmail);
    throw new Error('Email já registado.');
  }

  const hashedPassword = hashPassword(cleanedPassword);
  const newUser = {
    id: nextUserId(),
    name: cleanedName,
    email: cleanedEmail,
    password: hashedPassword,
  };

  users.push(newUser);
  saveUsers(users);

  const publicUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
  const token = jwtUtils.generateAccessToken(publicUser);

  return {
    user: publicUser,
    token,
  };
};

exports.login = async ({ email, password }) => {
  const cleanedEmail = normaliseEmail(email);
  const cleanedPassword = String(password || '').trim();

  if (!cleanedEmail || !cleanedPassword) {
    throw new Error('Email e palavra-passe são obrigatórios.');
  }

  const user = users.find((u) => u.email === cleanedEmail);
  if (!user) throw new Error('Utilizador não encontrado.');

  const passwordValid = verifyPassword(cleanedPassword, user.password);
  if (!passwordValid) throw new Error('Credenciais inválidas.');

  const publicUser = { id: user.id, name: user.name, email: user.email };
  const token = jwtUtils.generateAccessToken(publicUser);

  return { token, user: publicUser };
};

exports.update = async (id, { name, email }) => {
  const userId = Number(id);
  if (!Number.isFinite(userId)) {
    throw new Error('Identificador de utilizador inválido.');
  }

  const target = users.find((u) => u.id === userId);
  if (!target) {
    throw new Error('Utilizador não encontrado.');
  }

  const nextName = name !== undefined ? normaliseName(name) : target.name;
  const nextEmail = email !== undefined ? normaliseEmail(email) : target.email;

  if (!nextName) {
    throw new Error('O nome é obrigatório.');
  }
  if (!nextEmail) {
    throw new Error('O email é obrigatório.');
  }

  const emailExists =
    nextEmail !== target.email && users.some((u) => u.email === nextEmail);
  if (emailExists) {
    throw new Error('Email já registado.');
  }

  target.name = nextName;
  target.email = nextEmail;

  saveUsers(users);

  const publicUser = { id: target.id, name: target.name, email: target.email };
  const token = jwtUtils.generateAccessToken(publicUser);

  return { user: publicUser, token };
};

exports.verify = async (token) => {
  const decoded = jwtUtils.verifyToken(token);
  if (!decoded) {
    throw new Error('Token inválido ou expirado.');
  }
  const target = users.find((user) => user.id === decoded.id);
  if (!target) {
    throw new Error('Utilizador não encontrado.');
  }
  return {
    id: target.id,
    email: target.email,
    name: target.name,
  };
};

// Utilitário para facilitar testes
exports.__resetForTests = () => {
  users = [];
  try {
    if (fs.existsSync(USERS_FILE)) {
      fs.unlinkSync(USERS_FILE);
    }
  } catch (error) {
    console.error('Falha ao limpar ficheiro de utilizadores nos testes:', error);
  }
  saveUsers(users);
};
