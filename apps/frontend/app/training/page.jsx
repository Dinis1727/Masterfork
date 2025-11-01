"use client";
import React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrainingAPI } from '../../lib/api';

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
    <div className="page">
      <header className="page__header">
        <h1>Formações MasterFork</h1>
        <p>
          A MasterFork promove formações profissionais nas áreas de <strong>cozinha</strong>,
          <strong> pastelaria</strong>, <strong>serviço de mesa</strong> e <strong>bar</strong>,
          destinadas a profissionais e entusiastas da restauração que procuram elevar as suas
          competências.
        </p>
      </header>

      <section className="grid">
        <div className="card">
          <Image
            src="/training/cozinha.png"
            alt="Formação de Cozinha Profissional"
            width={1200}
            height={800}
            className="training__image"
            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
          <h2>Cozinha Profissional</h2>
          <p>
            Aprenda técnicas modernas de confeção e empratamento, com foco na qualidade e eficiência
            de cozinha.
          </p>
        </div>
        <div className="card">
          <Image
            src="/training/pastelaria-padaria.png"
            alt="Formação de Pastelaria e Padaria"
            width={1200}
            height={800}
            className="training__image"
            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
          <h2>Pastelaria e Padaria</h2>
          <p>
            Descubra o segredo por trás das sobremesas perfeitas e domine o fabrico de pão
            artesanal.
          </p>
        </div>
        <div className="card">
          <Image
            src="/training/servico-sala.png"
            alt="Formação de Serviço de Mesa e Bar"
            width={1200}
            height={800}
            className="training__image"
            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
          <h2>Serviço de Mesa e Bar</h2>
          <p>
            Melhore a experiência do cliente com técnicas de atendimento e mixologia profissional.
          </p>
        </div>
      </section>

      <section className="form">
        <h2>Inscreva-se</h2>
        <p>Preencha o formulário abaixo para garantir a sua vaga na próxima formação.</p>

        {success && (
          <div className="success-message">Inscrição enviada com sucesso! Entraremos em contacto brevemente.</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form__row">
            <label htmlFor="nome">Nome Completo</label>
            <input type="text" id="nome" {...register('nome')} aria-invalid={!!errors.nome} />
            {errors.nome && <span className="form__error">{errors.nome.message}</span>}
          </div>

          <div className="form__row">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" {...register('email')} aria-invalid={!!errors.email} />
            {errors.email && <span className="form__error">{errors.email.message}</span>}
          </div>

          <div className="form__row">
            <label htmlFor="formacao">Área de Interesse</label>
            <select id="formacao" {...register('formacao')} aria-invalid={!!errors.formacao}>
              <option value="">Selecione uma opção</option>
              <option value="cozinha">Cozinha Profissional</option>
              <option value="pastelaria">Pastelaria e Padaria</option>
              <option value="mesa">Serviço de Mesa e Bar</option>
            </select>
            {errors.formacao && <span className="form__error">{errors.formacao.message}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            Enviar Inscrição
          </button>
        </form>
      </section>
    </div>
  );
}
