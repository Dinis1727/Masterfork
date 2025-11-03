"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { OrdersAPI, AuthAPI } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';

const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const normaliseItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const name = item.name || item.title || '';
      if (!name) return null;
      const qty = Number(item.qty ?? item.quantity ?? 1) || 1;
      const price = parseCurrency(item.price ?? item.unitPrice);
      const lineTotal =
        parseCurrency(item.lineTotal ?? item.total) ?? (Number.isFinite(price) ? price * qty : null);
      return {
        id: item.id || item.sku || `${name}-${qty}`,
        name,
        qty,
        price,
        lineTotal,
        image: item.image || item.thumbnail || '',
      };
    })
    .filter(Boolean);
};

const parseSummaryText = (summary) => {
  if (typeof summary !== 'string') return { items: [], total: null, note: '' };
  const lines = summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const items = [];
  let total = null;
  const noteLines = [];

  lines.forEach((line) => {
    const totalMatch = line.match(/total\s*:\s*€?\s*([\d,.]+)/i);
    if (totalMatch) {
      const parsed = parseCurrency(totalMatch[1]);
      if (parsed !== null) total = parsed;
      return;
    }
    const itemMatch = line.match(/(.+?)\s+x\s*(\d+)\s*=\s*€?\s*([\d,.]+)/i);
    if (itemMatch) {
      const [, name, qtyStr, lineTotalStr] = itemMatch;
      const qty = Number.parseInt(qtyStr, 10) || 1;
      const lineTotal = parseCurrency(lineTotalStr);
      items.push({
        id: `${name}-${qty}`,
        name: name.trim(),
        qty,
        price: lineTotal !== null ? lineTotal / qty : null,
        lineTotal,
      });
      return;
    }
    noteLines.push(line);
  });

  return {
    items,
    total,
    note: noteLines.join('\n'),
  };
};

const extractOrderDetails = (order) => {
  const directItems =
    order?.items || order?.cartItems || order?.orderItems || order?.payload?.items || null;
  let items = normaliseItems(directItems);
  let total =
    parseCurrency(order?.total) ??
    parseCurrency(order?.cartTotal) ??
    parseCurrency(order?.payload?.total) ??
    null;
  let summaryNote = '';

  if (!items.length) {
    const summary = order?.cartSummary || order?.summary || '';
    const parsed = parseSummaryText(summary);
    items = parsed.items;
    if (total === null) total = parsed.total;
    summaryNote = parsed.note;
  }

  if (!items.length && Array.isArray(order?.payload?.items)) {
    items = normaliseItems(order.payload.items);
  }

  if (total === null && items.length) {
    total = items.reduce((acc, item) => acc + (item.lineTotal ?? 0), 0);
  }

  return {
    items,
    total,
    summaryNote,
  };
};

const formatOrderDate = (value) => {
  if (!value) return { date: '—', time: '' };
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: '—', time: '' };
    const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatter = new Intl.DateTimeFormat('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      date: dateFormatter.format(date),
      time: timeFormatter.format(date),
    };
  } catch {
    return { date: '—', time: '' };
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout, setSession } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [accountForm, setAccountForm] = useState({ name: '', email: '' });
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/profile');
    }
  }, [loading, user, router]);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      setOrdersError('');
      try {
        const response = await OrdersAPI.list();
        if (!isMounted) return;
        const list = response?.data?.orders || response?.data?.items || [];
        setOrders(Array.isArray(list) ? list : []);
      } catch (error) {
        if (!isMounted) return;
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          logout();
          router.replace('/login?next=/profile');
          return;
        }
        setOrdersError('Não foi possível carregar as encomendas. Tente novamente mais tarde.');
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user, logout, router]);

  const sortedOrders = useMemo(() => {
    const copy = Array.isArray(orders) ? [...orders] : [];
    return copy.sort((a, b) => {
      const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [orders]);

  useEffect(() => {
    if (user) {
      setAccountForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleAccountChange = (event) => {
    const { name, value } = event.target;
    setAccountForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setAccountMessage('');
    setAccountError('');
  };

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    setSavingAccount(true);
    setAccountMessage('');
    setAccountError('');
    try {
      const payload = {
        name: accountForm.name.trim(),
        email: accountForm.email.trim(),
      };
      if (!payload.name) {
        setAccountError('O nome é obrigatório.');
        return;
      }
      if (!payload.email) {
        setAccountError('O email é obrigatório.');
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
        setAccountError('Introduza um email válido.');
        return;
      }
      const response = await AuthAPI.updateProfile(payload);
      const { user: updatedUser, token } = response.data || {};
      if (!updatedUser) {
        throw new Error('Resposta inválida do servidor.');
      }
      setSession({ user: updatedUser, token });
      setAccountMessage('Dados atualizados com sucesso.');
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
        logout();
        router.replace('/login?next=/profile');
        return;
      }
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Não foi possível atualizar os dados. Tente novamente.';
      setAccountError(message);
    } finally {
      setSavingAccount(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="page profile-page">
        <p>A carregar perfil...</p>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <header className="profile-page__header">
        <div className="profile-page__headline">
          <p className="page__eyebrow">Perfil</p>
          <h1>Olá, {user.name || user.email}</h1>
          <p>Consulte as suas encomendas recentes e atualize os seus dados sempre que necessário.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={handleLogout}>
          Terminar sessão
        </button>
      </header>

      <div className="profile-tabs" role="tablist">
        <button
          type="button"
          className={`profile-tab${activeTab === 'orders' ? ' profile-tab--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
        >
          Encomendas
        </button>
        <button
          type="button"
          className={`profile-tab${activeTab === 'account' ? ' profile-tab--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'account'}
          onClick={() => setActiveTab('account')}
        >
          Dados da conta
        </button>
      </div>

      {activeTab === 'account' ? (
        <section className="profile-card" role="tabpanel">
          <h2>Dados da conta</h2>
          <form className="profile-account-form" onSubmit={handleAccountSubmit}>
            <div className="form__row">
              <label htmlFor="account-name">Nome</label>
              <input
                id="account-name"
                name="name"
                type="text"
                value={accountForm.name}
                onChange={handleAccountChange}
                placeholder="O seu nome"
              />
            </div>

            <div className="form__row">
              <label htmlFor="account-email">Email</label>
              <input
                id="account-email"
                name="email"
                type="email"
                value={accountForm.email}
                onChange={handleAccountChange}
                placeholder="nome@masterfork.pt"
              />
            </div>

            {accountMessage && (
              <div className="success-message" role="status">
                {accountMessage}
              </div>
            )}
            {accountError && (
              <div className="profile-card__error" role="alert">
                {accountError}
              </div>
            )}

            <div className="profile-account-actions">
              <button type="submit" className="btn-primary" disabled={savingAccount}>
                {savingAccount ? 'A guardar...' : 'Guardar alterações'}
              </button>
              <Link href="/contacts" className="profile-card__link">
                Necessita de ajuda?
              </Link>
            </div>
          </form>
        </section>
      ) : (
        <section className="profile-card" role="tabpanel">
          <div className="profile-card__header">
            <h2>Histórico de encomendas</h2>
            <Link href="/shop" className="btn-secondary">
              Nova encomenda
            </Link>
          </div>
          {loadingOrders ? (
            <p>A carregar encomendas...</p>
          ) : ordersError ? (
            <p className="profile-card__error">{ordersError}</p>
          ) : sortedOrders.length === 0 ? (
            <p>Ainda não existem encomendas associadas à sua conta.</p>
          ) : (
            <ul className="profile-orders">
              {sortedOrders.map((order, index) => {
                const details = extractOrderDetails(order);
                const { date, time } = formatOrderDate(order.createdAt || order.created_at);
                const itemCount = details.items.length;
                return (
                  <li
                    key={order.id || order.orderId || order.createdAt || `order-${index}`}
                    className="profile-orders__item"
                  >
                    <header className="profile-orders__header">
                      <div>
                        <p className="profile-orders__timestamp">
                          <span>{date}</span>
                          {time ? <span>{time}</span> : null}
                        </p>
                        <p className="profile-orders__summary">
                          {itemCount > 0
                            ? `${itemCount} ${itemCount === 1 ? 'produto' : 'produtos'}`
                            : 'Detalhes disponíveis abaixo'}
                        </p>
                      </div>
                      {details.total !== null ? (
                        <span className="profile-orders__total">
                          €{details.total.toFixed(2)}
                        </span>
                      ) : null}
                    </header>

                    {details.items.length > 0 ? (
                      <div className="cart-preview cart-preview--order-history" role="list">
                        {details.items.map((item) => {
                          const hasImage =
                            typeof item.image === 'string' && item.image.startsWith('/');
                          return (
                            <div key={item.id} className="cart-preview__item" role="listitem">
                              <div className="cart-preview__media">
                                {hasImage ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={72}
                                    height={72}
                                    className="cart-preview__image"
                                  />
                                ) : (
                                  <div className="cart-preview__placeholder" aria-hidden="true">
                                    🍽️
                                  </div>
                                )}
                              </div>
                              <div className="cart-preview__details">
                                <span className="cart-preview__name">{item.name}</span>
                                <span className="cart-preview__meta">
                                  {item.qty} x{' '}
                                  {Number.isFinite(item.price)
                                    ? `€${item.price.toFixed(2)}`
                                    : '—'}
                                </span>
                              </div>
                              {Number.isFinite(item.lineTotal) ? (
                                <span className="cart-preview__line-total">
                                  €{item.lineTotal.toFixed(2)}
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                        {Number.isFinite(details.total) ? (
                          <div className="cart-preview__total">
                            Total: €{details.total.toFixed(2)}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {details.summaryNote ? (
                      <pre className="profile-orders__note">{details.summaryNote}</pre>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
