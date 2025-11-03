"use client";

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthAPI } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';

const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Indique o seu nome.' })
      .trim()
      .min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    email: z
      .string({ required_error: 'Indique o seu email.' })
      .email('Introduza um email válido.'),
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
    <div className="page login-page">
      <header className="page__header login-page__header">
        <p className="eyebrow">Portal MasterFork</p>
        <h1>Criar conta</h1>
        <p>Registe-se para aceder ao painel de encomendas e às ferramentas internas.</p>
      </header>

      {isRegistered && (
        <div className="success-message" role="status">
          Conta criada com sucesso! A redireccionar...
        </div>
      )}

      {errorMessage && (
        <div className="login-page__error" role="alert">
          {errorMessage}
        </div>
      )}

      <form className="form login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form__row">
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            type="text"
            placeholder="Nome completo"
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && <span className="form__error">{errors.name.message}</span>}
        </div>

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

        <div className="form__row">
          <label htmlFor="confirmPassword">Confirmar palavra-passe</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="********"
            {...register('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <span className="form__error">{errors.confirmPassword.message}</span>
          )}
        </div>

        <div className="form__row login-form__options">
          <label className="login-form__remember">
            <input type="checkbox" {...register('remember')} />
            Manter sessão iniciada
          </label>

          <Link href="/login" className="login-form__link">
            Já tenho conta
          </Link>
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'A criar conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="login-form__footer">
        Ao criar conta concorda com as nossas políticas de privacidade.{' '}
        <Link href="/contacts">Fale connosco</Link> para suporte.
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="page login-page"><p>A carregar…</p></div>}>
      <RegisterContent />
    </Suspense>
  );
}
