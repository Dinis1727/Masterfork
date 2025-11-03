"use client";

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthAPI } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Indique o seu email.' })
    .email('Email inválido.'),
  password: z
    .string({ required_error: 'Indique a palavra-passe.' })
    .min(6, 'A palavra-passe deve ter pelo menos 6 caracteres.'),
  remember: z.coerce.boolean().optional().default(true),
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const redirectPath = useMemo(() => {
    const nextParam = searchParams?.get('next');
    if (!nextParam || typeof nextParam !== 'string') return '/';
    if (!nextParam.startsWith('/')) return '/';
    try {
      const url = new URL(nextParam, 'https://masterfork.local');
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return '/';
    }
  }, [searchParams]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const onSubmit = async (values) => {
    setErrorMessage('');
    try {
      const response = await AuthAPI.login({
        email: values.email,
        password: values.password,
      });
      const { token, user } = response.data || {};
      if (!token) throw new Error('Token não recebido.');

      setSession({ token, user, persist: values.remember });
      setIsAuthenticated(true);

      setTimeout(() => {
        router.push(redirectPath);
      }, 800);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        (error?.response?.status === 401
          ? 'Credenciais inválidas. Verifique o email e a palavra-passe.'
          : 'Não foi possível iniciar sessão. Tente novamente.');
      setErrorMessage(message);
    }
  };

  return (
    <div className="page login-page">
      <header className="page__header login-page__header">
        <p className="eyebrow">Portal MasterFork</p>
        <h1>Entrar na conta</h1>
        <p>
          Aceda às ferramentas internas introduzindo as credenciais fornecidas pela equipa.
        </p>
      </header>

      {isAuthenticated && (
        <div className="success-message" role="status">
          Sessão iniciada com sucesso! A redireccionar...
        </div>
      )}

      {errorMessage && (
        <div className="login-page__error" role="alert">
          {errorMessage}
        </div>
      )}

      <form className="form login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form__row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="nome@masterfork.pt"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className="form__error">{errors.email.message}</span>}
        </div>

        <div className="form__row">
          <label htmlFor="password">Palavra-passe</label>
          <input
            id="password"
            type="password"
            placeholder="********"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && <span className="form__error">{errors.password.message}</span>}
        </div>

        <div className="form__row login-form__options">
          <label className="login-form__remember">
            <input type="checkbox" {...register('remember')} />
            Manter sessão iniciada
          </label>

          <Link href="/contacts" className="login-form__link">
            Recuperar palavra-passe
          </Link>
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'A entrar...' : 'Entrar'}
        </button>
      </form>

      <p className="login-form__footer">
        Ainda não tem conta? <Link href="/register">Criar conta</Link> em poucos segundos.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="page login-page"><p>A carregar…</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
