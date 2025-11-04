"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { OrdersAPI, AuthAPI } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

const normalisePhone = (value) => (typeof value === 'string' ? value.replace(/[^\d+]/g, '') : '');
const isValidPhone = (value) => {
  const digits = normalisePhone(value).replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
};

const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;

  const normalized = value.replace(/[^\d,.-]/g, '');
  if (!normalized) return null;

  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  const hasComma = lastComma !== -1;
  const hasDot = lastDot !== -1;

  let cleaned = normalized;

  if (hasComma && hasDot) {
    if (lastComma > lastDot) {
      cleaned = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = normalized.replace(/,/g, '');
    }
  } else if (hasComma) {
    cleaned = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasDot) {
    const decimalDigits = normalized.length - lastDot - 1;
    if (decimalDigits === 3 && lastDot > 0) {
      cleaned = normalized.replace(/\./g, '');
    } else {
      cleaned = normalized.replace(/,/g, '');
    }
  }

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
  const [accountForm, setAccountForm] = useState({ name: '', email: '', phone: '' });
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
        phone: user.phone || '',
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
      const phoneRaw = accountForm.phone.trim();
      if (!phoneRaw) {
        setAccountError('O número de telemóvel é obrigatório.');
        return;
      }
      if (!isValidPhone(phoneRaw)) {
        setAccountError('Introduza um número de telemóvel válido.');
        return;
      }
      payload.phone = normalisePhone(phoneRaw);
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
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-bark-800/70 bg-bark-900/70 p-10 text-sm text-bark-100/70">
        A carregar perfil...
      </div>
    );
  }

  const tabButton = (tab, label) => {
    const isActive = activeTab === tab;
    return (
      <button
        type="button"
        key={tab}
        className={`${pillBase} px-6 py-2 text-sm font-semibold ${
          isActive
            ? 'bg-amber-gradient text-bark-900 shadow-soft'
            : 'bg-transparent text-bark-100/80 hover:text-amberglass'
        }`}
        role="tab"
        aria-selected={isActive}
        onClick={() => setActiveTab(tab)}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <header
        data-reveal
        className="flex translate-y-6 flex-col gap-6 rounded-3xl border border-bark-800/70 bg-bark-900/70 p-8 opacity-0 shadow-brand backdrop-blur-md md:flex-row md:items-start md:justify-between"
        style={{ transitionDelay: '0.05s' }}
      >
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-amberglass/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amberglass">
            Perfil
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Olá, {user.name || user.email}</h1>
            <p className="mt-2 max-w-2xl text-sm text-bark-100/80">
              Consulte as suas encomendas recentes, acompanhe o histórico MasterBeer e atualize os seus dados sempre que necessário.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={`${pillBase} bg-bark-950/70 text-bark-100 hover:bg-bark-900`}
          onClick={handleLogout}
        >
          Terminar sessão
        </button>
      </header>

      <div
        data-reveal
        className="inline-flex translate-y-6 items-center gap-2 rounded-full border border-bark-800/70 bg-bark-900/70 p-1 opacity-0 shadow-soft backdrop-blur-md"
        role="tablist"
        style={{ transitionDelay: '0.1s' }}
      >
        {tabButton('orders', 'Encomendas')}
        {tabButton('account', 'Dados da conta')}
      </div>

      {activeTab === 'account' ? (
        <section
          data-reveal
          className="translate-y-6 space-y-6 rounded-3xl border border-bark-800/70 bg-bark-900/70 p-8 opacity-0 shadow-brand backdrop-blur-md"
          role="tabpanel"
          style={{ transitionDelay: '0.15s' }}
        >
          <h2 className="text-2xl font-semibold text-white">Dados da conta</h2>
          <form className="grid gap-6" onSubmit={handleAccountSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="account-name" className="text-sm font-semibold text-bark-100">
                Nome
              </label>
              <input
                id="account-name"
                name="name"
                type="text"
                value={accountForm.name}
                onChange={handleAccountChange}
                placeholder="O seu nome"
                className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="account-email" className="text-sm font-semibold text-bark-100">
                Email
              </label>
              <input
                id="account-email"
                name="email"
                type="email"
                value={accountForm.email}
                onChange={handleAccountChange}
                placeholder="nome@masterfork.pt"
                className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="account-phone" className="text-sm font-semibold text-bark-100">
                Telemóvel
              </label>
              <input
                id="account-phone"
                name="phone"
                type="tel"
                value={accountForm.phone}
                onChange={handleAccountChange}
                placeholder="912 345 678"
                className="rounded-2xl border border-bark-700/70 bg-bark-950/60 px-4 py-3 text-sm text-bark-100 outline-none transition focus:border-amberglass focus:ring-2 focus:ring-amberglass/40"
              />
            </div>

            {accountMessage && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200 md:col-span-2" role="status">
                {accountMessage}
              </div>
            )}
            {accountError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 md:col-span-2" role="alert">
                {accountError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 md:col-span-2">
              <button
                type="submit"
                className={`${pillBase} bg-amber-gradient text-bark-900 shadow-soft hover:shadow-brand disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={savingAccount}
              >
                {savingAccount ? 'A guardar...' : 'Guardar alterações'}
              </button>
              <Link href="/contacts" className="text-sm font-semibold text-amberglass hover:underline">
                Necessita de ajuda?
              </Link>
            </div>
          </form>
        </section>
      ) : (
        <section
          data-reveal
          className="translate-y-6 space-y-6 rounded-3xl border border-bark-800/70 bg-bark-900/70 p-8 opacity-0 shadow-brand backdrop-blur-md"
          role="tabpanel"
          style={{ transitionDelay: '0.18s' }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-white">Histórico de encomendas</h2>
            <Link href="/shop" className={`${pillBase} bg-bark-950/70 text-bark-100 hover:bg-bark-900`}>
              Nova encomenda
            </Link>
          </div>
          {loadingOrders ? (
            <p className="text-sm text-bark-400">A carregar encomendas...</p>
          ) : ordersError ? (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">{ordersError}</p>
          ) : sortedOrders.length === 0 ? (
            <p className="text-sm text-bark-400">Ainda não existem encomendas associadas à sua conta.</p>
          ) : (
            <ul className="space-y-5">
              {sortedOrders.map((order, index) => {
                const details = extractOrderDetails(order);
                const { date, time } = formatOrderDate(order.createdAt || order.created_at);
                const itemCount = details.items.length;
                return (
                  <li
                    key={order.id || order.orderId || order.createdAt || `order-${index}`}
                    className="rounded-3xl border border-bark-800/70 bg-bark-950/60 p-6 shadow-soft transition hover:border-amberglass/40 hover:shadow-brand"
                  >
                    <header className="flex flex-col gap-3 border-b border-bark-800/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {date}
                          {time ? <span className="ml-2 text-xs text-bark-400">{time}</span> : null}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-bark-500">
                          {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'produto' : 'produtos'}` : 'Detalhes disponíveis abaixo'}
                        </p>
                      </div>
                      {details.total !== null ? (
                        <span className="rounded-full border border-amberglass/40 px-4 py-1 text-sm font-semibold text-amberglass">
                          €{details.total.toFixed(2)}
                        </span>
                      ) : null}
                    </header>

                    {details.items.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {details.items.map((item) => {
                          const hasImage = typeof item.image === 'string' && item.image.startsWith('/');
                          return (
                            <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-bark-800/70 bg-bark-900/60 p-4">
                              <div className="h-16 w-16 overflow-hidden rounded-xl border border-bark-800/70 bg-bark-950/70">
                                {hasImage ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={72}
                                    height={72}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xl">🍽️</div>
                                )}
                              </div>
                              <div className="flex flex-1 flex-col gap-1 text-sm text-bark-100/80">
                                <span className="font-semibold text-white">{item.name}</span>
                                <span className="text-xs text-bark-400">
                                  {item.qty} x {Number.isFinite(item.price) ? `€${item.price.toFixed(2)}` : '—'}
                                </span>
                              </div>
                              {Number.isFinite(item.lineTotal) ? (
                                <span className="text-sm font-semibold text-amberglass">
                                  €{item.lineTotal.toFixed(2)}
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                        {Number.isFinite(details.total) ? (
                          <div className="flex justify-end text-sm font-semibold text-amberglass">
                            Total: €{details.total.toFixed(2)}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {details.summaryNote ? (
                      <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-bark-800/70 bg-bark-900/60 px-4 py-3 text-xs text-bark-300">
                        {details.summaryNote}
                      </pre>
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
