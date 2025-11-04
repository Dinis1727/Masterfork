"use client";
import React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrainingAPI } from '../../lib/api';

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Indique um email válido'),
  formacao: z.enum(['cozinha', 'pastelaria', 'mesa'], {
    required_error: 'Selecione uma área',
  }),
});

export default function TrainingPage() {
  const [success, setSuccess] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { nome: '', email: '', formacao: '' } });

  const onSubmit = async (data) => {
    try {
      const res = await TrainingAPI.create(data);
      const ok = res && res.status >= 200 && res.status < 300 && res.data && res.data.success === true;
      if (!ok) throw new Error('Resposta inválida do servidor');
      setSuccess(true);
      reset();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Falha ao enviar inscrição de formação:', err);
      // eslint-disable-next-line no-alert
      alert('Ocorreu um erro ao enviar. Tente novamente.');
    }
  };
  return (
    <div className="space-y-12">
      <header
        data-reveal
        className="translate-y-6 space-y-4 text-center opacity-0"
        style={{ transitionDelay: '0.05s' }}
      >
        <span className="inline-flex items-center rounded-full border border-amberglass/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amberglass">
          Formação MasterFork
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Programas para equipas extraordinárias</h1>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-bark-100/80 sm:text-base">
          Cozinha, pastelaria, bar e serviço de mesa com metodologias exclusivas, conteúdos certificados e mentoria contínua.
          Construímos equipas prontas para responder aos desafios da hotelaria moderna.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            src: '/training/cozinha.png',
            title: 'Cozinha Profissional',
            desc: 'Domine técnicas modernas de confeção, mise en place inteligente e gestão de brigadas em vários turnos.',
          },
          {
            src: '/training/pastelaria-padaria.png',
            title: 'Pastelaria & Padaria',
            desc: 'Fermentações controladas, sobremesas de autor e padaria artesanal com controlo absoluto de qualidade.',
          },
          {
            src: '/training/servico-sala.png',
            title: 'Serviço de Mesa & Bar',
            desc: 'Experiência do cliente, vinhos e mixologia com performance e storytelling memoráveis.',
          },
        ].map((card, index) => (
          <div
            key={card.title}
            data-reveal
            className="flex h-full translate-y-6 flex-col overflow-hidden rounded-3xl border border-bark-800/60 bg-bark-900/60 opacity-0 shadow-brand backdrop-blur-md"
            style={{ transitionDelay: `${0.1 + index * 0.05}s` }}
          >
            <Image
              src={card.src}
              alt={card.title}
              width={1200}
              height={800}
              className="h-52 w-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
            />
            <div className="flex flex-1 flex-col gap-3 p-6">
              <h2 className="text-xl font-semibold text-white">{card.title}</h2>
              <p className="text-sm text-bark-100/80">{card.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section
        data-reveal
        className="translate-y-6 rounded-3xl border border-bark-800/80 bg-bark-900/70 p-8 opacity-0 shadow-brand backdrop-blur-md"
        style={{ transitionDelay: '0.25s' }}
      >
        <h2 className="text-2xl font-semibold text-white">Inscreva-se</h2>
        <p className="mt-2 text-sm text-bark-100/80">Preencha o formulário para garantir a sua vaga na próxima turma.</p>

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">
            Inscrição enviada com sucesso! Entraremos em contacto brevemente.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="nome" className="text-sm font-semibold text-bark-100">Nome Completo</label>
            <input
              type="text"
              id="nome"
              {...register('nome')}
              aria-invalid={!!errors.nome}
              className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
            />
            {errors.nome && <span className="text-sm text-red-300">{errors.nome.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-bark-100">Email</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              aria-invalid={!!errors.email}
              className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
            />
            {errors.email && <span className="text-sm text-red-300">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
            <label htmlFor="formacao" className="text-sm font-semibold text-bark-100">Área de Interesse</label>
            <select
              id="formacao"
              {...register('formacao')}
              aria-invalid={!!errors.formacao}
              className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
            >
              <option value="">Selecione uma opção</option>
              <option value="cozinha">Cozinha Profissional</option>
              <option value="pastelaria">Pastelaria e Padaria</option>
              <option value="mesa">Serviço de Mesa e Bar</option>
            </select>
            {errors.formacao && <span className="text-sm text-red-300">{errors.formacao.message}</span>}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className={`${pillBase} bg-amber-gradient text-bark-900 shadow-soft hover:shadow-brand disabled:cursor-not-allowed disabled:opacity-60`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A enviar...' : 'Enviar Inscrição'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
