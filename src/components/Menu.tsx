import { Category, Product } from '../lib/db';
import { Plus } from 'lucide-react';

interface MenuProps {
  categories: Category[];
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  Beverages: 'Напитки',
  Snacks: 'Закуски',
};

export function Menu({ categories, products, onAddToCart }: MenuProps) {
  return (
    <div className="space-y-14">
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.category_id === category.id
        );

        return (
          <section key={category.id}>
            {/* Заголовок категории */}
            <div className="mb-6">
              <h2 className="text-4xl font-extrabold text-slate-900">
                {CATEGORY_LABELS[category.name] ?? category.name}
              </h2>
              <div className="h-1 w-12 bg-purple-600 rounded-full mt-2" />
            </div>

            {/* Товары */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition group"
                >
                  {/* Название */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {product.name}
                  </h3>

                  {/* Цена */}
                  <p className="text-3xl font-extrabold text-purple-600 mb-6">
                    ${(product.price / 100).toFixed(2)}
                  </p>

                  {/* Кнопка */}
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-purple-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                    Добавить
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
