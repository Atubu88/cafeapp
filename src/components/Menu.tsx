import { useMemo } from 'react';
import { Category, Product, CartItem } from '../lib/db';
import { Plus, Minus } from 'lucide-react';

interface MenuProps {
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  Beverages: 'Напитки',
  Snacks: 'Закуски',
};

export function Menu({
  categories,
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
}: MenuProps) {
  // быстрый доступ: productId → quantity
  const cartMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cart]);

  return (
    <div className="space-y-14">
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.category_id === category.id
        );

        return (
          <section key={category.id}>
            {/* Заголовок категории */}
            <h2 className="text-3xl font-extrabold mb-6">
              {CATEGORY_LABELS[category.name] ?? category.name}
            </h2>

            {/* Товары */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {categoryProducts.map((product) => {
                const quantity = cartMap[product.id] ?? 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-extrabold text-purple-600 mb-6">
                        ${(product.price / 100).toFixed(2)}
                      </p>
                    </div>

                    {/* КНОПКА / СЧЁТЧИК */}
                    {quantity === 0 ? (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
                      >
                        Добавить
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-100 rounded-xl px-4 py-2">
                        <button
                          onClick={() =>
                            onUpdateQuantity(product.id, quantity - 1)
                          }
                          className="p-2 rounded-lg bg-white shadow"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="font-bold text-lg">
                          {quantity}
                        </span>

                        <button
                          onClick={() =>
                            onUpdateQuantity(product.id, quantity + 1)
                          }
                          className="p-2 rounded-lg bg-white shadow"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
