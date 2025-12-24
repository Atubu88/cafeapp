import { useEffect, useMemo, useState } from 'react';
import { fetchOrders, Order } from '../lib/db';
import { OrdersTable } from '../components/OrdersTable';

interface AdminOrdersPageProps {
  onNavigate: (path: string) => void;
}

const formatDate = (value: string) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

export function AdminOrdersPage({ onNavigate }: AdminOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchOrders();
    setLoading(false);

    if (result.error) {
      setError(result.error);
      setOrders([]);
      return;
    }

    setOrders(result.orders);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesQuery = query
        ? order.id.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesDate = date
        ? formatDate(order.created_at) === date
        : true;
      return matchesQuery && matchesDate;
    });
  }, [orders, query, date]);

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-purple-500 font-semibold">
              Администрирование
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Заказы</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/admin/menu')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white"
            >
              Меню
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white"
            >
              Витрина
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm text-slate-600">Поиск по ID</label>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Введите часть ID"
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Дата заказа</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadOrders}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
              >
                Обновить
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setDate('');
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600"
              >
                Сбросить
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
            Загрузка заказов…
          </div>
        ) : (
          <OrdersTable orders={filteredOrders} />
        )}
      </div>
    </div>
  );
}
