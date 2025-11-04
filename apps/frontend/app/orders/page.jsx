"use client";
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrdersAPI } from '../../lib/api';

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  business: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value.length >= 2, 'O nome do estabelecimento deve ter pelo menos 2 caracteres'),
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
              const lineTotal = Number.isFinite(lineRaw) ? lineRaw : Math.round(price * qty * 100) / 100;
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
      const business = typeof data.business === 'string' && data.business.trim().length > 0 ? data.business.trim() : undefined;
      const message = typeof data.message === 'string' && data.message.trim().length > 0 ? data.message.trim() : '';

      const payload = { name, email };
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
        router.push(`/login?next=${encodeURIComponent('/orders')}`);
        return;
      }
      // eslint-disable-next-line no-alert
      alert('Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <div className="space-y-10">
      <header
        data-reveal
        className="translate-y-6 space-y-3 opacity-0"
        style={{ transitionDelay: '0.05s' }}
      >
        <span className="inline-flex items-center rounded-full border border-amberglass/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amberglass">
          Finalizar encomenda
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Detalhes para faturação</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-bark-100/80 sm:text-base">
          Confirme os dados de faturação e envie o pedido. Após recepção, a nossa equipa valida a disponibilidade, envia
          a fatura e agenda a entrega ou recolha no showroom MasterFork.
        </p>
      </header>

      <Suspense fallback={null}>
        <CartPrefill setValue={setValue} setCartDetails={setCartDetails} />
      </Suspense>

      {success && (
        <div
          className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200"
          style={{ transitionDelay: '0.1s' }}
        >
          Encomenda finalizada com sucesso! Em breve receberá um email com os próximos passos.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <form
          data-reveal
          className="translate-y-6 space-y-6 rounded-3xl border border-bark-800/70 bg-bark-900/70 p-8 opacity-0 shadow-brand backdrop-blur-md"
          onSubmit={handleSubmit(onSubmit)}
          style={{ transitionDelay: '0.12s' }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-bark-100">
                Nome
              </label>
              <input
                id="name"
                {...register('name')}
                type="text"
                aria-invalid={!!errors.name}
                className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
              />
              {errors.name && <span className="text-sm text-red-300">{errors.name.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="business" className="text-sm font-semibold text-bark-100">
                Nome do estabelecimento (opcional)
              </label>
              <input
                id="business"
                {...register('business')}
                type="text"
                aria-invalid={!!errors.business}
                className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
              />
              {errors.business && <span className="text-sm text-red-300">{errors.business.message}</span>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="email" className="text-sm font-semibold text-bark-100">
                Email de faturação
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                aria-invalid={!!errors.email}
                className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
              />
              {errors.email && <span className="text-sm text-red-300">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="message" className="text-sm font-semibold text-bark-100">
                Observações / resumo da encomenda
              </label>
              <textarea
                id="message"
                {...register('message')}
                rows={6}
                className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
              />
              {errors.message && <span className="text-sm text-red-300">{errors.message.message}</span>}
              <p className="text-xs text-bark-500">
                Pode acrescentar indicações de entrega ou outra informação relevante. Limite de 2000 caracteres.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className={`${pillBase} bg-amber-gradient text-bark-900 shadow-soft hover:shadow-brand disabled:cursor-not-allowed disabled:opacity-60`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A enviar...' : 'Confirmar Encomenda'}
            </button>
            {cartDetails.total > 0 && (
              <span className="rounded-full border border-amberglass/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amberglass">
                Total estimado €{cartDetails.total.toFixed(2)}
              </span>
            )}
          </div>
        </form>

        <aside
          data-reveal
          className="flex h-fit translate-y-6 flex-col gap-6 rounded-3xl border border-bark-800/70 bg-bark-900/70 p-8 opacity-0 shadow-brand backdrop-blur-md"
          style={{ transitionDelay: '0.18s' }}
        >
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">Resumo da encomenda</h2>
            <p className="text-sm text-bark-100/70">
              Os detalhes do carrinho são enviados juntamente com o formulário para acelerar a faturação.
            </p>
          </div>

          {cartDetails.items.length === 0 ? (
            <div className="rounded-2xl border border-bark-800/70 bg-bark-950/60 px-4 py-6 text-sm text-bark-400">
              O carrinho está vazio. Volte à loja e adicione produtos antes de finalizar a encomenda.
            </div>
          ) : (
            <ul className="space-y-4">
              {cartDetails.items.map((item) => (
                <li key={item.id} className="flex gap-3 rounded-2xl border border-bark-800/70 bg-bark-950/60 p-4">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-bark-900 text-amberglass">🍺</div>
                  )}
                  <div className="flex flex-1 flex-col gap-1 text-sm text-bark-100/80">
                    <strong className="text-white">{item.name}</strong>
                    <span className="text-xs text-bark-500">Qtd: {item.qty}</span>
                    <span className="text-sm font-semibold text-amberglass">€{item.lineTotal.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-2xl border border-bark-800/70 bg-bark-950/60 px-4 py-4 text-sm text-bark-100">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <strong className="text-lg text-amberglass">€{cartDetails.total.toFixed(2)}</strong>
            </div>
          </div>

          {cartDetails.summaryText && (
            <pre className="overflow-auto rounded-2xl border border-bark-800/70 bg-bark-950/60 px-4 py-3 text-xs text-bark-400">
              {cartDetails.summaryText}
            </pre>
          )}
        </aside>
      </div>
    </div>
  );
}
