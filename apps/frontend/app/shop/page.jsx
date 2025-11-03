"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const products = [
  { id: 'masterbeer-cidra', name: 'Masterbeer Cidra', price: 3.5, image: '/shop/cidra.png', description: 'Cerveja artesanal leve e equilibrada.' },
  { id: 'masterbeer-ipa', name: 'Masterbeer IPA', price: 4.0, image: '/shop/ipa.png', description: 'Cerveja artesanal com lupulo intenso.' },
  { id: 'masterbeer-loira', name: 'Masterbeer Loira', price: 3.5, image: '/shop/loira.png', description: 'Cerveja artesanal leve e equilibrada.' },
  { id: 'masterbeer-preta', name: 'Masterbeer Preta', price: 4.5, image: '/shop/preta.png', description: 'Cerveja artesanal encorpada e torrada.' },
  { id: 'masterbeer-ruiva', name: 'Masterbeer Ruiva', price: 3.5, image: '/shop/ruiva.png', description: 'Cerveja artesanal leve e equilibrada.' },
  { id: 'masterbeer-sacarolhas', name: 'Sacarolhas Masterfork', price: 6.0, image: '/shop/sacarolhas-masterfork.png', description: 'Saca Rolhas personalizado Masterfork.' },
  { id: 'masterbeer-pack-copos', name: 'Pack de Copos Masterbeer', price: 12.0, image: '/shop/pack-de-copos.png', description: 'Conjunto com 2 personalizados.' },
  { id: 'masterbeer-pack-degustacao', name: 'Pack Degustacao Masterbeer', price: 12.0, image: '/shop/pack-degustacao.png', description: 'Conjunto com 4 cervejas artesanais de 33cl.' },
  { id: 'masterbeer-pack-premium', name: 'Pack Premium Masterbeer', price: 12.0, image: '/shop/pack-premium.png', description: 'Conjunto com 4 cervejas artesanais de 33cl + 1 cerveja artesanal de 75cl.' },
];

function ProductCard({ p, qty, add, dec }) {
  const [wbOk, setWbOk] = React.useState(true);
  const wbSrc = p.image.replace(/(\.[a-z0-9]+)$/i, '-wb$1');
  return (
    <article className="product-card">
      <div className="product-card__media">
        <span className="product-card__imgwrap">
          <Image src={p.image} alt={p.name} width={240} height={160} className="product-card__image product-card__image--base" />
          {wbOk && (
            <Image
              src={wbSrc}
              alt={p.name}
              width={240}
              height={160}
              className="product-card__image product-card__image--hover"
              onError={() => setWbOk(false)}
            />
          )}
        </span>
      </div>
      <div className="product-card__body">
        <h3 className="product-card__title">{p.name}</h3>
        <p className="product-card__desc">{p.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">€{p.price.toFixed(2)}</span>
          <div className="product-card__actions">
            <button className="btn-secondary" onClick={() => dec(p.id)} aria-label={`Remover ${p.name}`}>-</button>
            <span className="product-card__qty" aria-live="polite">{qty}</span>
            <button className="btn-primary" onClick={() => add(p.id)} aria-label={`Adicionar ${p.name}`}>+</button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ShopPage() {
  const [cart, setCart] = React.useState({}); // { productId: quantity }
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('todas');
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const dec = (id) => setCart((c) => {
    const next = { ...c };
    if (!next[id]) return next;
    next[id] = Math.max(0, next[id] - 1);
    if (next[id] === 0) delete next[id];
    return next;
  });
  const removeItem = (id) => setCart((c) => { const n = { ...c }; delete n[id]; return n; });

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const p = products.find((x) => x.id === id);
    return p ? { ...p, qty, lineTotal: +(p.price * qty).toFixed(2) } : null;
  }).filter(Boolean);

  const total = cartItems.reduce((acc, it) => acc + it.lineTotal, 0);

  const summary = cartItems.length
    ? cartItems.map((it) => `${it.name} x${it.qty} = €${it.lineTotal.toFixed(2)}`).join(' | ') +
      ` | Total: €${total.toFixed(2)}`
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

  // Infer category from id
  const categoryOf = (p) => {
    if (p.id.includes('sacarolhas')) return 'acessorio';
    if (p.id.includes('pack-copos') || p.id.includes('pack-degustacao') || p.id.includes('pack-premium')) return 'pack';
    if (p.id.startsWith('masterbeer-')) return 'cerveja';
    return 'outros';
  };

  // Apply search and filters
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
    <div className="page shop-page">
      <header className="page__header">
        <h1>Loja</h1>
        <p>Adicione produtos ao carrinho e finalize a sua encomenda.</p>
      </header>

      <section className="shop-controls" aria-label="Procurar e filtrar produtos">
        <div className="search" role="search">
          <svg className="search__icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/>
          </svg>
          <input
            type="search"
            className="search__input"
            placeholder="Procurar produtos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Procurar produtos"
          />
        </div>
        <div className="filters" aria-label="Filtros">
          <div className="filters__group">
            <span className="filters__label">Categoria</span>
            <div className="category-pills" role="group" aria-label="Categorias">
              {['todas','cerveja','pack','acessorio','outros'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={"pill" + (category === c ? " pill--active" : "")}
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <label className="filters__field">
            <span>Preço mínimo</span>
            <input type="number" min="0" step="0.1" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </label>
          <label className="filters__field">
            <span>Preço máximo</span>
            <input type="number" min="0" step="0.1" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </label>
        </div>
      </section>

      <div className="shop-layout">
        <section className="shop-grid" aria-label="Lista de produtos">
          {filtered.length === 0 && (
            <p style={{ gridColumn: '1 / -1', opacity: .8 }}>Sem resultados para a pesquisa/filtragem actual.</p>
          )}
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} qty={cart[p.id] || 0} add={add} dec={dec} />
          ))}
        </section>

        <aside className="cart" id="cart" aria-label="Carrinho">
          <h2>Carrinho</h2>
          {cartItems.length === 0 ? (
            <p>O carrinho está vazio.</p>
          ) : (
            <ul className="cart__list">
              {cartItems.map((it) => (
                <li key={it.id} className="cart__item">
                  <div>
                    <strong>{it.name}</strong> x{it.qty}
                    <div className="cart__mutate">
                      <button className="btn-secondary" onClick={() => dec(it.id)}>-</button>
                      <button className="btn-secondary" onClick={() => add(it.id)}>+</button>
                      <button className="btn-secondary" onClick={() => removeItem(it.id)}>Remover</button>
                    </div>
                  </div>
                  <span>€{it.lineTotal.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="cart__total">
            <span>Total</span>
            <strong>€{total.toFixed(2)}</strong>
          </div>
          <div className="cart__actions">
            {cartItems.length === 0 ? (
              <button className="btn-primary" type="button" disabled>
                Finalizar encomenda
              </button>
            ) : (
              <Link href={ordersLink} className="btn-primary">
                Finalizar encomenda
              </Link>
            )}
          </div>
        </aside>
      </div>

      {/* Floating cart widget */}
      <button
        type="button"
        className="cart-widget"
        onClick={() => {
          const el = typeof document !== 'undefined' && document.getElementById('cart');
          if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        aria-label="Ir para o carrinho"
      >
        <span className="cart-widget__icon" aria-hidden="true">🛒</span>
        <span className="cart-widget__text">Carrinho</span>
        <span className="cart-widget__badge">{cartItems.reduce((n, it) => n + it.qty, 0)}</span>
      </button>
    </div>
  );
}
