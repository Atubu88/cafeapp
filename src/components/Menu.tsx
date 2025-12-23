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
    <div className="space-y-10">
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.category_id === category.id
        );

        return (
          <div key={category.id}>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              {CATEGORY_LABELS[category.name] ?? category.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-xl shadow-card p-6 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-muted">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-primary text-white p-3 rounded-xl hover:bg-primaryDark transition"
                    aria-label="Добавить в корзину"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
