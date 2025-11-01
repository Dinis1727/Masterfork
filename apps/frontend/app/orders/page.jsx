"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrdersAPI } from '../../lib/api';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  business: z.string().min(2, 'Nome do estabelecimento obrigatório'),
  email: z.string().email('Indique um email válido'),
  services: z.enum(['menus', 'equipamento', 'formacao', 'consultoria'], {
    required_error: 'Selecione um serviço',
  }),
  message: z.string().max(2000).optional(),
});

export default function OrdersPage() {
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', business: '', email: '', services: '', message: '' },
  });

  const onSubmit = async (data) => {
    try {
      const res = await OrdersAPI.create(data);
      const ok = res && res.status >= 200 && res.status < 300 && (
        (res.data && typeof res.data.message === 'string') ||
        (res.data && res.data.success === true)
      );
      if (!ok) throw new Error('Resposta inválida do servidor');
      setSuccess(true);
      reset();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao enviar encomenda:', error);
      // eslint-disable-next-line no-alert
      alert('Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <div className="page">
      <h1>Fazer Encomenda</h1>
      <p>
        Partilhe connosco os detalhes da sua necessidade e entraremos em contacto em menos de 24h
        para personalizar a solução MasterFork para o seu negócio.
      </p>

      {success && (
        <div className="success-message">Pedido enviado com sucesso! Entraremos em contacto brevemente.</div>
      )}

      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form__row">
          <label>Nome do responsável</label>
          <input {...register('name')} name="name" type="text" aria-invalid={!!errors.name} />
          {errors.name && <span style={{ color: '#b3261e' }}>{errors.name.message}</span>}
        </div>

        <div className="form__row">
          <label>Nome do estabelecimento</label>
          <input {...register('business')} name="business" type="text" aria-invalid={!!errors.business} />
          {errors.business && <span style={{ color: '#b3261e' }}>{errors.business.message}</span>}
        </div>

        <div className="form__row">
          <label>Email profissional</label>
          <input {...register('email')} name="email" type="email" aria-invalid={!!errors.email} />
          {errors.email && <span style={{ color: '#b3261e' }}>{errors.email.message}</span>}
        </div>

        <div className="form__row">
          <label>Serviços de interesse</label>
          <select {...register('services')} name="services" aria-invalid={!!errors.services}>
            <option value="">Selecione uma opção</option>
            <option value="menus">Criação de menu & carta de bebidas</option>
            <option value="equipamento">Equipamento de cozinha / bar</option>
            <option value="formacao">Formação de equipas</option>
            <option value="consultoria">Consultoria operacional</option>
          </select>
          {errors.services && <span style={{ color: '#b3261e' }}>{errors.services.message}</span>}
        </div>

        <div className="form__row">
          <label>Conte-nos mais sobre o seu projeto</label>
          <textarea {...register('message')} name="message" rows="4" />
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          Enviar pedido
        </button>
      </form>
    </div>
  );
}
