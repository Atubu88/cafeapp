import { Order } from '../lib/db';

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
        Заказы пока не найдены.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-purple-500 font-semibold">
                Заказ #{order.id}
              </p>
              <p className="text-sm text-slate-500">
                {new Date(order.created_at).toLocaleString('ru-RU')}
              </p>
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {order.total_price.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Позиции</p>
            <div className="space-y-2">
              {order.items.length === 0 && (
                <p className="text-sm text-slate-400">Нет позиций.</p>
              )}
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {item.product?.name || 'Без названия'}
                    </p>
                    <p className="text-xs text-slate-500">ID: {item.product?.id}</p>
                  </div>
                  <div className="text-sm text-slate-600">
                    {item.quantity} × {item.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
