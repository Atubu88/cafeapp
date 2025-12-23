import { useState } from 'react';
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
  // активная категория (по умолчанию первая)
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id
  );

  const activeCategory = categories.find(
    (c) => c.id === activeCategoryId
  );

  const filteredProducts = products.filter(
    (p) => p.category_id === activeCategoryId
  );

  return (
    <div className="space-y-10">
      {/* 🔹 Горизонтальные табы категорий */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;

          return (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition
                ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-slate-700 border hover:bg-slate-100'
                }
              `}
            >
              {CATEGORY_LABELS[category.name] ?? category.name}
            </button>
          );
        })}
      </div>

      {/* 🔹 Заголовок выбранной категории */}
      {activeCategory && (
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2">
            {CATEGORY_LABELS[activeCategory.name] ?? activeCategory.name}
          </h2>
        </div>
      )}

      {/* 🔹 Товары выбранной категории */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
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
    </div>
  );
}
