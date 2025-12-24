import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export async function checkAdminAccess(): Promise<{
  hasSession: boolean;
  isAdmin: boolean;
  error?: string;
}> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return {
      hasSession: false,
      isAdmin: false,
      error: error?.message,
    };
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', data.session.user.id)
    .maybeSingle();

  if (adminError) {
    return {
      hasSession: true,
      isAdmin: false,
      error: adminError.message,
    };
  }

  return {
    hasSession: true,
    isAdmin: Boolean(adminUser),
  };
}

export async function fetchMenu(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  try {
    const [categoriesResult, productsResult] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('products').select('*'),
    ]);

    if (categoriesResult.error || productsResult.error) {
      throw new Error('Failed to fetch menu');
    }

    return {
      categories: categoriesResult.data || [],
      products: productsResult.data || [],
    };
  } catch (err) {
    console.error('Error fetching menu:', err);
    return { categories: [], products: [] };
  }
}

export async function saveOrder(items: CartItem[]): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  try {
    const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{ total_price: totalPrice }])
      .select()
      .single();

    if (orderError || !orderData) {
      throw new Error('Failed to create order');
    }

    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error('Failed to save order items');
    }

    return {
      success: true,
      orderId: orderData.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
