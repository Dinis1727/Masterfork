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

const normalisePhone = (value) => (typeof value === 'string' ? value.replace(/[^\d+]/g, '') : '');
const isValidPhone = (value) => {
  const digits = normalisePhone(value).replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
};

const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Indique o seu nome.' })
      .trim()
      .min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    email: z
      .string({ required_error: 'Indique o seu email.' })
      .email('Introduza um email válido.'),
    phone: z
      .string({ required_error: 'Indique o número de telemóvel.' })
      .trim()
      .refine((value) => isValidPhone(value), 'Introduza um número de telemóvel válido.'),
    password: z
      .string({ required_error: 'Escolha uma palavra-passe.' })
      .min(6, 'A palavra-passe deve ter pelo menos 6 caracteres.'),
    confirmPassword: z
      .string({ required_error: 'Confirme a palavra-passe.' })
      .min(6, 'Confirmação inválida.'),
    remember: z.coerce.boolean().optional().default(true),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As palavras-passe não coincidem.',
  });

function RegisterContent() {
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
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      remember: true,
    },
  });

  const onSubmit = async (values) => {
    setErrorMessage('');
    try {
      const response = await AuthAPI.register({
        name: values.name,
        email: values.email,
        phone: normalisePhone(values.phone),
        password: values.password,
      });

      const { token, user } = response.data || {};
      if (!token) throw new Error('Token não recebido.');

      setSession({ token, user, persist: values.remember });
      setIsRegistered(true);

      setTimeout(() => {
        router.push(redirectPath);
      }, 800);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        (error?.response?.status === 409
          ? 'Este email já está registado.'
          : 'Não foi possível criar a conta. Tente novamente.');
      setErrorMessage(message);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-bark-800/70 bg-bark-900/70 p-8 shadow-brand">
      <header className="space-y-3 text-center">
        <span className="inline-flex items-center rounded-full border border-amberglass/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amberglass">
          Portal MasterFork
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Criar conta</h1>
        <p className="text-sm text-bark-100/80">
          Registe-se para aceder ao painel de encomendas e às ferramentas internas.
        </p>
      </header>

      {isRegistered && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200" role="status">
          Conta criada com sucesso! A redireccionar...
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200" role="alert">
          {errorMessage}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold text-bark-100">Nome</label>
          <input
            id="name"
            type="text"
            placeholder="Nome completo"
            {...register('name')}
            aria-invalid={!!errors.name}
            className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
          />
          {errors.name && <span className="text-sm text-red-300">{errors.name.message}</span>}
        </div>

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
          <label htmlFor="phone" className="text-sm font-semibold text-bark-100">Telemóvel</label>
          <input
            id="phone"
            type="tel"
            placeholder="912 345 678"
            {...register('phone')}
            aria-invalid={!!errors.phone}
            className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
          />
          {errors.phone && <span className="text-sm text-red-300">{errors.phone.message}</span>}
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

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-bark-100">Confirmar palavra-passe</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="********"
            {...register('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
            className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
          />
          {errors.confirmPassword && <span className="text-sm text-red-300">{errors.confirmPassword.message}</span>}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm text-bark-100/80">
            <input type="checkbox" {...register('remember')} className="h-4 w-4 rounded border-bark-700 bg-bark-950 text-amberglass focus:ring-amberglass" />
            Manter sessão iniciada
          </label>
          <Link href="/login" className="text-sm font-semibold text-amberglass hover:underline">
            Já tenho conta
          </Link>
        </div>

        <button
          type="submit"
          className={`${pillBase} w-full bg-amber-gradient text-bark-900 shadow-soft hover:shadow-brand disabled:cursor-not-allowed disabled:opacity-60`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'A criar conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-bark-100/70">
        Ao criar conta concorda com as nossas políticas de privacidade.{' '}
        <Link href="/contacts" className="font-semibold text-amberglass hover:underline">Fale connosco</Link> para suporte.
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl rounded-3xl border border-bark-800/70 bg-bark-900/70 p-8 text-center text-sm text-bark-100/70">
          A carregar…
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
