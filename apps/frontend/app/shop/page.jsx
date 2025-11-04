"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const products = [
  { id: 'masterbeer-cidra', name: 'Masterbeer Cidra', price: 3.5, image: '/shop/cidra.png', description: 'Cerveja artesanal leve e equilibrada.' },
  { id: 'masterbeer-ipa', name: 'Masterbeer IPA', price: 4.0, image: '/shop/ipa.png', description: 'Cerveja artesanal com lúpulo intenso.' },
  { id: 'masterbeer-loira', name: 'Masterbeer Loira', price: 3.5, image: '/shop/loira.png', description: 'Perfil suave com notas florais e citrinas.' },
  { id: 'masterbeer-preta', name: 'Masterbeer Preta', price: 4.5, image: '/shop/preta.png', description: 'Cerveja encorpada com maltes torrados e final persistente.' },
  { id: 'masterbeer-ruiva', name: 'Masterbeer Ruiva', price: 3.5, image: '/shop/ruiva.png', description: 'Blend caramelizado com leve especiaria.' },
  { id: 'masterbeer-sacarolhas', name: 'Sacarolhas MasterFork', price: 6.0, image: '/shop/sacarolhas-masterfork.png', description: 'Acessório premium para serviço à mesa.' },
  { id: 'masterbeer-pack-copos', name: 'Pack de Copos MasterBeer', price: 12.0, image: '/shop/pack-de-copos.png', description: 'Conjunto com dois copos personalizados.' },
  { id: 'masterbeer-pack-degustacao', name: 'Pack Degustação', price: 12.0, image: '/shop/pack-degustacao.png', description: 'Degustação com quatro rótulos de 33cl.' },
  { id: 'masterbeer-pack-premium', name: 'Pack Premium MasterBeer', price: 18.0, image: '/shop/pack-premium.png', description: 'Seleção exclusiva com edição 75cl.' },
];

const categoryOf = (p) => {
  if (p.id.includes('sacarolhas')) return 'acessorio';
  if (p.id.includes('pack-copos') || p.id.includes('pack-degustacao') || p.id.includes('pack-premium')) return 'pack';
  if (p.id.startsWith('masterbeer-')) return 'cerveja';
  return 'outros';
};

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

function ProductCard({ p, qty, add, dec, index }) {
  const [wbOk, setWbOk] = React.useState(true);
  const wbSrc = p.image.replace(/(\.[a-z0-9]+)$/i, '-wb$1');

  return (
    <article
      data-reveal
      className="flex h-full translate-y-6 flex-col overflow-hidden rounded-3xl border border-bark-800/60 bg-bark-900/70 opacity-0 shadow-brand backdrop-blur-md"
      style={{ transitionDelay: `${0.1 + index * 0.04}s` }}
    >
      <div className="relative flex items-center justify-center bg-bark-950/70 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-amberglass/10 to-bark-950/60" aria-hidden="true" />
        <span className="relative inline-block">
          <Image
            src={p.image}
            alt={p.name}
            width={240}
            height={200}
            className="h-40 w-auto object-contain transition-all duration-200"
            priority={index < 3}
          />
          {wbOk && (
            <Image
              src={wbSrc}
              alt={p.name}
              width={240}
              height={200}
              className="absolute inset-0 h-40 w-full object-contain opacity-0 transition-opacity duration-200 hover:opacity-100"
              onError={() => setWbOk(false)}
            />
          )}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-white">{p.name}</h3>
          <p className="text-sm text-bark-100/80">{p.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-amberglass">€{p.price.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`${pillBase} h-10 w-10 rounded-full border border-bark-700/70 bg-bark-950/40 px-0 py-0 text-lg text-amberglass hover:border-amberglass/70`}
              onClick={() => dec(p.id)}
              aria-label={`Remover ${p.name}`}
            >
              -
            </button>
            <span className="min-w-[2ch] text-center text-sm font-semibold text-white" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              className={`${pillBase} h-10 w-10 rounded-full bg-amber-gradient px-0 py-0 text-lg text-bark-900 shadow-soft hover:shadow-brand`}
              onClick={() => add(p.id)}
              aria-label={`Adicionar ${p.name}`}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ShopPage() {
  const [cart, setCart] = React.useState({});
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('todas');
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const dec = (id) =>
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return next;
      next[id] = Math.max(0, next[id] - 1);
      if (next[id] === 0) delete next[id];
      return next;
    });
  const removeItem = (id) =>
    setCart((c) => {
      const n = { ...c };
      delete n[id];
      return n;
    });

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? { ...p, qty, lineTotal: +(p.price * qty).toFixed(2) } : null;
    })
    .filter(Boolean);

  const total = cartItems.reduce((acc, it) => acc + it.lineTotal, 0);

  const summary = cartItems.length
    ? `${cartItems.map((it) => `${it.name} x${it.qty} = €${it.lineTotal.toFixed(2)}`).join(' | ')} | Total: €${total.toFixed(2)}`
    : '';

  const cartDataParam = cartItems.length
    ? encodeURIComponent(
        JSON.stringify(
          cartItems.map(({ id, name, qty, price, image, lineTotal }) => ({
            id,
            name,
            qty,
            price,
            image,
            lineTotal,
          }))
        )
      )
    : '';

  const ordersLink =
    cartItems.length && summary
      ? `/orders?cart=${encodeURIComponent(summary)}&items=${cartDataParam}`
      : '/orders';

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchesCategory = category === 'todas' || categoryOf(p) === category;
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    const matchesMin = Number.isNaN(min) ? true : p.price >= min;
    const matchesMax = Number.isNaN(max) ? true : p.price <= max;
    return matchesQuery && matchesCategory && matchesMin && matchesMax;
  });

  return (
    <div className="space-y-10">
      <header
        data-reveal
        className="translate-y-6 space-y-4 text-center opacity-0"
        style={{ transitionDelay: '0.05s' }}
      >
        <span className="inline-flex items-center rounded-full border border-amberglass/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amberglass">
          MasterBeer Shop
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">A loja oficial da MasterFork</h1>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-bark-100/80 sm:text-base">
          Adicione produtos ao carrinho, explore packs especiais e finalize a encomenda com um clique. Mantemos o stock actualizado e sugestões de harmonização.
        </p>
      </header>

      <section
        data-reveal
        className="flex translate-y-6 flex-col gap-6 rounded-3xl border border-bark-800/60 bg-bark-900/70 p-6 opacity-0 shadow-brand backdrop-blur-md"
        aria-label="Procurar e filtrar produtos"
        style={{ transitionDelay: '0.12s' }}
      >
        <div className="flex flex-col gap-3">
          <label htmlFor="search" className="text-sm font-semibold text-bark-100">
            Procurar produtos
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-bark-700/60 bg-bark-950/60 px-4 py-3">
            <svg className="h-5 w-5 text-amberglass" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
              />
            </svg>
            <input
              id="search"
              type="search"
              placeholder="Procurar por rótulo ou descrição..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-bark-100 outline-none placeholder:text-bark-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-bark-100">Categoria</span>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {['todas', 'cerveja', 'pack', 'acessorio', 'outros'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${pillBase} border text-xs uppercase tracking-wide ${
                    category === c
                      ? 'border-amberglass/70 bg-amberglass/20 text-amberglass'
                      : 'border-bark-700/60 bg-bark-950/60 text-bark-200 hover:border-amberglass/40 hover:text-amberglass'
                  }`}
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-bark-100">Preço mínimo (€)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-2xl border border-bark-700/60 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-bark-100">Preço máximo (€)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-2xl border border-bark-700/60 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
              />
            </label>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Lista de produtos">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-bark-400">
              Sem resultados para a pesquisa actual. Ajuste os filtros e tente novamente.
            </p>
          )}
          {filtered.map((p, index) => (
            <ProductCard key={p.id} p={p} qty={cart[p.id] || 0} add={add} dec={dec} index={index} />
          ))}
        </section>

        <aside
          data-reveal
          className="flex h-fit translate-y-6 flex-col gap-6 rounded-3xl border border-bark-800/60 bg-bark-900/70 p-6 opacity-0 shadow-brand backdrop-blur-md"
          id="cart"
          aria-label="Carrinho de compras"
          style={{ transitionDelay: '0.12s' }}
        >
          <div>
            <h2 className="text-2xl font-semibold text-white">Carrinho</h2>
            <p className="text-sm text-bark-100/70">Resumo dos produtos seleccionados.</p>
          </div>
          {cartItems.length === 0 ? (
            <p className="rounded-2xl border border-bark-800/70 bg-bark-950/60 px-4 py-6 text-center text-sm text-bark-400">
              Ainda não adicionou produtos. Explore os rótulos MasterBeer.
            </p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((it) => (
                <li
                  key={it.id}
                  className="flex flex-col gap-3 rounded-2xl border border-bark-800/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="text-white">{it.name}</strong>
                      <div className="text-xs text-bark-400">€{it.price.toFixed(2)} unidade</div>
                    </div>
                    <span className="text-sm font-semibold text-amberglass">€{it.lineTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={`${pillBase} border border-bark-700/60 bg-bark-900/60 text-xs uppercase tracking-wide hover:border-amberglass/60`}
                      onClick={() => dec(it.id)}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      className={`${pillBase} border border-bark-700/60 bg-bark-900/60 text-xs uppercase tracking-wide hover:border-amberglass/60`}
                      onClick={() => add(it.id)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className={`${pillBase} border border-bark-700/60 bg-bark-900/60 text-xs uppercase tracking-wide text-red-300 hover:border-red-400 hover:text-red-200`}
                      onClick={() => removeItem(it.id)}
                    >
                      Remover
                    </button>
                    <span className="ml-auto text-xs text-bark-400">Qtd: {it.qty}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between rounded-2xl border border-bark-800/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100">
            <span>Total</span>
            <strong className="text-lg text-amberglass">€{total.toFixed(2)}</strong>
          </div>
          <div className="flex flex-col gap-3">
            {cartItems.length === 0 ? (
              <button
                className={`${pillBase} bg-bark-800/70 text-bark-500`}
                type="button"
                disabled
              >
                Finalizar encomenda
              </button>
            ) : (
              <Link href={ordersLink} className={`${pillBase} bg-amber-gradient text-bark-900 shadow-soft hover:shadow-brand`}>
                Finalizar encomenda
              </Link>
            )}
            {summary && (
              <p className="rounded-2xl border border-bark-800/70 bg-bark-950/60 px-4 py-3 text-xs text-bark-400">
                {summary}
              </p>
            )}
          </div>
        </aside>
      </div>

      <button
        type="button"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-amberglass/40 bg-amber-gradient px-5 py-3 text-sm font-semibold text-bark-900 shadow-soft transition hover:shadow-brand sm:hidden"
        onClick={() => {
          const el = typeof document !== 'undefined' && document.getElementById('cart');
          if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        aria-label="Ir para o carrinho"
      >
        <span aria-hidden="true">🛒</span>
        <span>Carrinho ({cartItems.reduce((n, it) => n + it.qty, 0)})</span>
      </button>
    </div>
  );
}
