import { useMemo, useState, type FormEvent } from 'react';
import {
  Category,
  Product,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  updateCategory,
  updateProduct,
} from '../lib/db';

interface AdminMenuPageProps {
  categories: Category[];
  products: Product[];
  onCategoriesChange: (categories: Category[]) => void;
  onProductsChange: (products: Product[]) => void;
  onNavigate: (path: string) => void;
}

export function AdminMenuPage({
  categories,
  products,
  onCategoriesChange,
  onProductsChange,
  onNavigate,
}: AdminMenuPageProps) {
  const [categoryName, setCategoryName] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductName, setEditingProductName] = useState('');
  const [editingProductPrice, setEditingProductPrice] = useState('');
  const [editingProductCategoryId, setEditingProductCategoryId] =
    useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const handleCreateCategory = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!categoryName.trim()) {
      setError('Введите название категории.');
      return;
    }

    setSaving(true);
    const result = await createCategory(categoryName.trim());
    setSaving(false);

    if (!result.success || !result.category) {
      setError(result.error || 'Не удалось создать категорию.');
      return;
    }

    onCategoriesChange([...categories, result.category]);
    setCategoryName('');
  };

  const handleStartEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleUpdateCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingCategoryId) return;
    setError(null);

    if (!editingCategoryName.trim()) {
      setError('Введите название категории.');
      return;
    }

    setSaving(true);
    const result = await updateCategory(
      editingCategoryId,
      editingCategoryName.trim()
    );
    setSaving(false);

    if (!result.success || !result.category) {
      setError(result.error || 'Не удалось обновить категорию.');
      return;
    }

    onCategoriesChange(
      categories.map((category) =>
        category.id === result.category?.id ? result.category : category
      )
    );
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setError(null);
    setSaving(true);
    const result = await deleteCategory(categoryId);
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Не удалось удалить категорию.');
      return;
    }

    onCategoriesChange(categories.filter((category) => category.id !== categoryId));
    onProductsChange(products.filter((product) => product.category_id !== categoryId));
  };

  const handleCreateProduct = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!productName.trim()) {
      setError('Введите название товара.');
      return;
    }

    const parsedPrice = Number(productPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Введите корректную цену.');
      return;
    }

    if (!productCategoryId) {
      setError('Выберите категорию товара.');
      return;
    }

    setSaving(true);
    const result = await createProduct({
      name: productName.trim(),
      price: parsedPrice,
      category_id: productCategoryId,
    });
    setSaving(false);

    if (!result.success || !result.product) {
      setError(result.error || 'Не удалось создать товар.');
      return;
    }

    onProductsChange([...products, result.product]);
    setProductName('');
    setProductPrice('');
  };

  const handleStartEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditingProductName(product.name);
    setEditingProductPrice(product.price.toString());
    setEditingProductCategoryId(product.category_id);
  };

  const handleUpdateProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingProductId) return;
    setError(null);

    if (!editingProductName.trim()) {
      setError('Введите название товара.');
      return;
    }

    const parsedPrice = Number(editingProductPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Введите корректную цену.');
      return;
    }

    if (!editingProductCategoryId) {
      setError('Выберите категорию товара.');
      return;
    }

    setSaving(true);
    const result = await updateProduct({
      id: editingProductId,
      name: editingProductName.trim(),
      price: parsedPrice,
      category_id: editingProductCategoryId,
    });
    setSaving(false);

    if (!result.success || !result.product) {
      setError(result.error || 'Не удалось обновить товар.');
      return;
    }

    onProductsChange(
      products.map((product) =>
        product.id === result.product?.id ? result.product : product
      )
    );
    setEditingProductId(null);
    setEditingProductName('');
    setEditingProductPrice('');
    setEditingProductCategoryId('');
  };

  const handleDeleteProduct = async (productId: string) => {
    setError(null);
    setSaving(true);
    const result = await deleteProduct(productId);
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Не удалось удалить товар.');
      return;
    }

    onProductsChange(products.filter((product) => product.id !== productId));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-purple-500 font-semibold">
              Администрирование
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Управление меню</h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white"
          >
            Перейти в витрину
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <header>
            <h2 className="text-xl font-semibold text-slate-900">Категории</h2>
            <p className="text-sm text-slate-500">
              Добавляйте или редактируйте разделы меню.
            </p>
          </header>

          <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Новая категория"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
            >
              Добавить категорию
            </button>
          </form>

          <div className="space-y-3">
            {categories.length === 0 && (
              <p className="text-sm text-slate-500">Категории пока не добавлены.</p>
            )}
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 border border-slate-200 rounded-xl px-4 py-3"
              >
                {editingCategoryId === category.id ? (
                  <form
                    onSubmit={handleUpdateCategory}
                    className="flex-1 flex flex-col sm:flex-row gap-3"
                  >
                    <input
                      value={editingCategoryName}
                      onChange={(event) => setEditingCategoryName(event.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(null)}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">{category.name}</p>
                      <p className="text-xs text-slate-500">ID: {category.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEditCategory(category)}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600"
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600"
                      >
                        Удалить
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <header>
            <h2 className="text-xl font-semibold text-slate-900">Товары</h2>
            <p className="text-sm text-slate-500">
              Управляйте карточками блюд и напитков.
            </p>
          </header>

          <form onSubmit={handleCreateProduct} className="grid gap-3 md:grid-cols-4">
            <input
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              placeholder="Название товара"
              className="rounded-lg border border-slate-300 px-4 py-2"
            />
            <input
              value={productPrice}
              onChange={(event) => setProductPrice(event.target.value)}
              placeholder="Цена"
              className="rounded-lg border border-slate-300 px-4 py-2"
            />
            <select
              value={productCategoryId}
              onChange={(event) => setProductCategoryId(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2"
            >
              <option value="">Категория</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
            >
              Добавить товар
            </button>
          </form>

          <div className="space-y-3">
            {products.length === 0 && (
              <p className="text-sm text-slate-500">Товары пока не добавлены.</p>
            )}
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 border border-slate-200 rounded-xl px-4 py-3"
              >
                {editingProductId === product.id ? (
                  <form onSubmit={handleUpdateProduct} className="grid gap-3 md:grid-cols-4">
                    <input
                      value={editingProductName}
                      onChange={(event) => setEditingProductName(event.target.value)}
                      className="rounded-lg border border-slate-300 px-4 py-2"
                    />
                    <input
                      value={editingProductPrice}
                      onChange={(event) => setEditingProductPrice(event.target.value)}
                      className="rounded-lg border border-slate-300 px-4 py-2"
                    />
                    <select
                      value={editingProductCategoryId}
                      onChange={(event) =>
                        setEditingProductCategoryId(event.target.value)
                      }
                      className="rounded-lg border border-slate-300 px-4 py-2"
                    >
                      <option value="">Категория</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProductId(null)}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-slate-900 font-medium">{product.name}</p>
                        <p className="text-sm text-slate-500">
                          {categoryMap.get(product.category_id) || 'Без категории'}
                          <span className="mx-2">•</span>
                          {product.price.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditProduct(product)}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600"
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-2 rounded-lg border border-red-200 text-red-600"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">ID: {product.id}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
