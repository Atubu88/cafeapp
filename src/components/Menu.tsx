import { Category, Product, CartItem } from '../lib/db';
import { Plus } from 'lucide-react';

interface MenuProps {
  categories: Category[];
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function Menu({ categories, products, onAddToCart }: MenuProps) {
  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryProducts = products.filter((p) => p.category_id === category.id);
        return (
          <div key={category.id}>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">{product.name}</h3>
                    <p className="text-lg font-bold text-slate-600">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
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
