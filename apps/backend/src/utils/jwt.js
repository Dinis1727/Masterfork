const crypto = require('node:crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key';
const ACCESS_TOKEN_SECONDS = 60 * 60; // 1 hora
const REFRESH_TOKEN_SECONDS = 60 * 60 * 24 * 7; // 7 dias

const base64UrlEncode = (value) =>
  Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');

const base64UrlDecodeToObject = (segment) => {
  const decoded = Buffer.from(segment, 'base64url').toString('utf8');
  return JSON.parse(decoded);
};

const signToken = (payload, expiresInSeconds) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const headerPart = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
  const payloadPart = base64UrlEncode({
    ...payload,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
  });

  const data = `${headerPart}.${payloadPart}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');

  return `${data}.${signature}`;
};

const timingSafeEqual = (a, b) => {
  const bufferA = Buffer.from(a, 'base64url');
  const bufferB = Buffer.from(b, 'base64url');
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
};

const verifyTokenInternal = (token) => {
  if (!token || typeof token !== 'string') return null;
  const segments = token.split('.');
  if (segments.length !== 3) return null;

  const [headerPart, payloadPart, signature] = segments;
  const data = `${headerPart}.${payloadPart}`;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');

  if (!timingSafeEqual(signature, expectedSignature)) return null;

  const payload = base64UrlDecodeToObject(payloadPart);
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    return null;
  }
  return payload;
};

exports.generateAccessToken = (user) =>
  signToken(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    ACCESS_TOKEN_SECONDS,
  );

exports.generateRefreshToken = (user) =>
  signToken(
    {
      id: user.id,
    },
    REFRESH_TOKEN_SECONDS,
  );

exports.verifyToken = (token) => {
  try {
    return verifyTokenInternal(token);
  } catch (error) {
    console.error('Erro ao verificar token:', error.message);
    return null;
  }
};
