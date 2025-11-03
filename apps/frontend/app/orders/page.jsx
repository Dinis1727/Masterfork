"use client";
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrdersAPI } from '../../lib/api';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  business: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || value.length >= 2,
      'O nome do estabelecimento deve ter pelo menos 2 caracteres'
    ),
  email: z.string().email('Indique um email válido'),
  message: z.string().max(2000).optional(),
});

function CartPrefill({ setValue, setCartDetails }) {
  const searchParams = useSearchParams();
  React.useEffect(() => {
    const cartText = searchParams?.get('cart') || '';
    const cartItemsParam = searchParams?.get('items');

    let parsedItems = [];

    if (cartItemsParam) {
      try {
        const raw = JSON.parse(cartItemsParam);
        if (Array.isArray(raw)) {
          parsedItems = raw
            .map((item) => {
              if (!item) return null;
              const qty = Number(item.qty) || 0;
              if (qty <= 0) return null;
              const price = Number(item.price) || 0;
              const lineRaw = Number(item.lineTotal);
              const lineTotal = Number.isFinite(lineRaw)
                ? lineRaw
                : Math.round(price * qty * 100) / 100;
              return {
                id: item.id ? String(item.id) : String(item.name || 'item'),
                name: item.name ? String(item.name) : 'Item',
                qty,
                price: Math.round(price * 100) / 100,
                image: item.image && typeof item.image === 'string' ? item.image : '',
                lineTotal: Math.round(lineTotal * 100) / 100,
              };
            })
            .filter(Boolean);
        }
      } catch (error) {
        parsedItems = [];
      }
    }

    const total = parsedItems.reduce((acc, item) => acc + item.lineTotal, 0);

    const detailLines = parsedItems.length
      ? [
          ...parsedItems.map((item) => `${item.name} x${item.qty} = €${item.lineTotal.toFixed(2)}`),
          `Total: €${total.toFixed(2)}`,
        ]
      : cartText
          .split('|')
          .map((segment) => segment.trim())
          .filter(Boolean);

    const summaryText = detailLines.length ? `Resumo da encomenda:\n${detailLines.join('\n')}` : '';

    setValue('message', summaryText, { shouldDirty: false });

    if (setCartDetails) {
      setCartDetails({
        items: parsedItems,
        total,
        summaryText,
      });
    }
  }, [searchParams, setValue, setCartDetails]);
  return null;
}

export default function OrdersPage() {
  const router = useRouter();
  const [success, setSuccess] = React.useState(false);
  const [cartDetails, setCartDetails] = React.useState({
    items: [],
    total: 0,
    summaryText: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      business: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const name = typeof data.name === 'string' ? data.name.trim() : '';
      const email = typeof data.email === 'string' ? data.email.trim() : '';
      const business =
        typeof data.business === 'string' && data.business.trim().length > 0 ? data.business.trim() : undefined;
      const message = typeof data.message === 'string' && data.message.trim().length > 0 ? data.message.trim() : '';

      const payload = {
        name,
        email,
      };

      if (business) payload.business = business;
      if (message) payload.message = message;
      if (cartDetails.summaryText) payload.cartSummary = cartDetails.summaryText;
      if (Array.isArray(cartDetails.items) && cartDetails.items.length > 0) payload.items = cartDetails.items;
      if (cartDetails.total > 0) payload.total = cartDetails.total;

      const res = await OrdersAPI.create(payload);
      const ok =
        res &&
        res.status >= 200 &&
        res.status < 300 &&
        ((res.data && typeof res.data.message === 'string') || (res.data && res.data.success === true));
      if (!ok) throw new Error('Resposta inválida do servidor');
      setSuccess(true);
      reset();
      if (cartDetails.summaryText) {
        setValue('message', cartDetails.summaryText, { shouldDirty: false });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao enviar encomenda:', error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        const loginUrl = `/login?next=${encodeURIComponent('/orders')}`;
        router.push(loginUrl);
        return;
      }
      // eslint-disable-next-line no-alert
      alert('Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <div className="page">
      <h1>Finalizar Encomenda</h1>
      <p>
        Reveja os detalhes da sua encomenda. Após confirmação irá receber um email com a fatura.
        Após o pagamento, a sua encomenda será processada e enviada o mais breve possível.
      </p>

      <Suspense fallback={null}>
        <CartPrefill setValue={setValue} setCartDetails={setCartDetails} />
      </Suspense>

      {success && (
        <div className="success-message">
          Encomenda finalizada com sucesso! Entraremos em contacto brevemente.
        </div>
      )}

      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form__row">
          <label>Nome</label>
          <input {...register('name')} name="name" type="text" aria-invalid={!!errors.name} />
          {errors.name && <span style={{ color: '#b3261e' }}>{errors.name.message}</span>}
        </div>

        <div className="form__row">
          <label>Nome do estabelecimento (opcional)</label>
          <input
            {...register('business')}
            name="business"
            type="text"
            aria-invalid={!!errors.business}
          />
          {errors.business && (
            <span style={{ color: '#b3261e' }}>{errors.business.message}</span>
          )}
        </div>

        <div className="form__row">
          <label>Email de faturação</label>
          <input {...register('email')} name="email" type="email" aria-invalid={!!errors.email} />
          {errors.email && <span style={{ color: '#b3261e' }}>{errors.email.message}</span>}
        </div>

        <div className="form__row">
          <label>Resumo da encomenda</label>
          {cartDetails.items.length > 0 ? (
            <div className="cart-preview" role="list">
              {cartDetails.items.map((item) => (
                <div key={item.id} className="cart-preview__item" role="listitem">
                  <div className="cart-preview__media">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={72}
                      height={72}
                      className="cart-preview__image"
                    />
                  </div>
                  <div className="cart-preview__details">
                    <span className="cart-preview__name">{item.name}</span>
                    <span className="cart-preview__meta">
                      {item.qty} x €{item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="cart-preview__line-total">€{item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="cart-preview__total">
                Total: €{cartDetails.total.toFixed(2)}
              </div>
            </div>
          ) : cartDetails.summaryText ? (
            <pre className="cart-preview__fallback">{cartDetails.summaryText}</pre>
          ) : (
            <p className="cart-preview__empty">O carrinho está vazio.</p>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          Finalizar encomenda
        </button>
      </form>
    </div>
  );
}
