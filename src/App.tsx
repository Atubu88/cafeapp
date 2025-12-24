import { useEffect, useState } from 'react';
import {
  checkAdminAccess,
  fetchMenu,
  saveOrder,
  Category,
  Product,
  CartItem,
} from './lib/db';
import { Menu } from './components/Menu';
import { OrderConfirmation } from './components/OrderConfirmation';
import { CartPage } from './pages/CartPage';
import { AdminMenuPage } from './pages/AdminMenuPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ShoppingCart } from 'lucide-react';

type PageType = 'menu' | 'cart' | 'confirmation';

function App() {
  const [page, setPage] = useState<PageType>('menu');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [adminStatus, setAdminStatus] = useState({
    checked: false,
    isAdmin: false,
    hasSession: false,
    error: null as string | null,
  });
  const [adminRefreshKey, setAdminRefreshKey] = useState(0);
  const [path, setPath] = useState(() => window.location.pathname);

  const navigate = (nextPath: string) => {
    if (nextPath === path) return;
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };

  /* ---------- ADMIN GUARD ---------- */
  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const isAdminRoute = path.startsWith('/admin');

    const ensureAdminAccess = async () => {
      if (!isAdminRoute) {
        if (isMounted) {
          setAdminStatus((prev) => ({ ...prev, checked: true }));
        }
        return;
      }

      setAdminStatus((prev) => ({ ...prev, checked: false, error: null }));
      const result = await checkAdminAccess();

      if (!isMounted) return;

      setAdminStatus({
        checked: true,
        isAdmin: result.isAdmin,
        hasSession: result.hasSession,
        error: result.error ?? null,
      });
    };

    ensureAdminAccess();
    return () => {
      isMounted = false;
    };
  }, [path, adminRefreshKey]);

  /* ---------- LOAD MENU ---------- */
  useEffect(() => {
    const loadMenu = async () => {
      const { categories, products } = await fetchMenu();
      setCategories(categories);
      setProducts(products);
      setLoading(false);
    };

    loadMenu();
  }, []);

  /* ---------- CART ACTIONS ---------- */
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  /* ---------- ORDER ---------- */
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setOrderLoading(true);
    const result = await saveOrder(cart, { status: 'new', source: 'web' });
    setOrderLoading(false);

    if (result.success && result.orderId) {
      setOrderId(result.orderId);
      setCart([]);
      setPage('confirmation');
    } else {
      alert(`Ошибка при оформлении заказа: ${result.error}`);
    }
  };

  const handleNewOrder = () => {
    setPage('menu');
    setCart([]);
  };

  /* ---------- LOADING ---------- */
  const isAdminRoute = path.startsWith('/admin');
  const adminCheckPending = isAdminRoute && !adminStatus.checked;

  if (adminCheckPending || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Загрузка меню…</p>
      </div>
    );
  }

  if (isAdminRoute && !adminStatus.isAdmin) {
    return (
      <AdminLoginPage
        hasSession={adminStatus.hasSession}
        error={adminStatus.error}
        onLoginSuccess={() => setAdminRefreshKey((prev) => prev + 1)}
      />
    );
  }

  /* ---------- ADMIN MENU ---------- */
  if (path === '/admin/menu') {
    return (
      <AdminMenuPage
        categories={categories}
        products={products}
        onCategoriesChange={setCategories}
        onProductsChange={setProducts}
        onNavigate={navigate}
      />
    );
  }

  if (path === '/admin/orders') {
    return <AdminOrdersPage onNavigate={navigate} />;
  }

  /* ---------- CART PAGE ---------- */
  if (page === 'cart') {
    return (
      <CartPage
        items={cart}
        onBack={() => setPage('menu')}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handlePlaceOrder}
        isLoading={orderLoading}
      />
    );
  }

  /* ---------- CONFIRMATION ---------- */
  if (page === 'confirmation') {
    return (
      <OrderConfirmation
        orderId={orderId}
        onNewOrder={handleNewOrder}
      />
    );
  }

  /* ---------- MENU PAGE ---------- */
  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* HEADER (обычный, уезжает) */}
      <div className="max-w-7xl mx-auto px-4 py-6 mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-slate-900">
          Система заказов
        </h1>
        <button
          type="button"
          onClick={() => navigate('/admin/menu')}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white"
        >
          Админ-меню
        </button>
      </div>

      {/* MENU */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <Menu
          categories={categories}
          products={products}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
        />
      </div>

      {/* FLOATING CART BUTTON */}
      {cart.length > 0 && (
        <div
          onClick={() => setPage('cart')}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 cursor-pointer"
        >
          <div className="relative bg-purple-600 text-white rounded-full shadow-xl p-4 hover:scale-105 transition">
            <ShoppingCart className="w-6 h-6" />

            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cart.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
