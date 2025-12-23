import { CartItem } from '../lib/db';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: () => void;
  isLoading?: boolean;
}

export function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  isLoading = false,
}: CartProps) {
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-slate-600">Корзина пуста</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="p-4 border-b last:border-b-0 flex justify-between items-center"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">
                {item.product.name}
              </h3>
              <p className="text-slate-600">
                ${(item.product.price / 100).toFixed(2)} за шт.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  onUpdateQuantity(item.product.id, item.quantity - 1)
                }
                className="p-1 text-slate-600 hover:text-slate-800"
                disabled={isLoading}
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-8 text-center font-semibold">
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  onUpdateQuantity(item.product.id, item.quantity + 1)
                }
                className="p-1 text-slate-600 hover:text-slate-800"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={() => onRemoveItem(item.product.id)}
                className="p-1 text-red-500 hover:text-red-700"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-slate-800">
            Итого:
          </span>
          <span className="text-2xl font-bold text-blue-600">
            ${(total / 100).toFixed(2)}
          </span>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={isLoading}
          className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          {isLoading ? 'Оформление заказа...' : 'Заказать'}
        </button>
      </div>
    </div>
  );
}
