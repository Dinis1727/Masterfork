"use client";

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthAPI } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

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
    <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-bark-800/70 bg-bark-900/70 p-8 shadow-brand">
      <header className="space-y-3 text-center">
        <span className="inline-flex items-center rounded-full border border-amberglass/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amberglass">
          Portal MasterFork
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Entrar na conta</h1>
        <p className="text-sm text-bark-100/80">
          Aceda às ferramentas internas introduzindo as credenciais fornecidas pela equipa.
        </p>
      </header>

      {isAuthenticated && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200" role="status">
          Sessão iniciada com sucesso! A redireccionar...
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200" role="alert">
          {errorMessage}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-bark-100">Email</label>
          <input
            id="email"
            type="email"
            placeholder="nome@masterfork.pt"
            {...register('email')}
            aria-invalid={!!errors.email}
            className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
          />
          {errors.email && <span className="text-sm text-red-300">{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-bark-100">Palavra-passe</label>
          <input
            id="password"
            type="password"
            placeholder="********"
            {...register('password')}
            aria-invalid={!!errors.password}
            className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
          />
          {errors.password && <span className="text-sm text-red-300">{errors.password.message}</span>}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm text-bark-100/80">
            <input type="checkbox" {...register('remember')} className="h-4 w-4 rounded border-bark-700 bg-bark-950 text-amberglass focus:ring-amberglass" />
            Manter sessão iniciada
          </label>

          <Link href="/contacts" className="text-sm font-semibold text-amberglass hover:underline">
            Recuperar palavra-passe
          </Link>
        </div>

        <button
          type="submit"
          className={`${pillBase} w-full bg-amber-gradient text-bark-900 shadow-soft hover:shadow-brand disabled:cursor-not-allowed disabled:opacity-60`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'A entrar...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm text-bark-100/70">
        Ainda não tem conta?{' '}
        <Link href="/register" className="font-semibold text-amberglass hover:underline">
          Criar conta
        </Link>{' '}
        em poucos segundos.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl rounded-3xl border border-bark-800/70 bg-bark-900/70 p-8 text-center text-sm text-bark-100/70">
          A carregar…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
