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

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
  } | null;
}

export interface Order {
  id: string;
  total_price: number;
  created_at: string;
  status: string;
  source: string;
  tg_user_id?: string | null;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
  } | null;
}

export interface Order {
  id: string;
  total_price: number;
  created_at: string;
  status: string;
  source: string;
  tg_user_id?: string | null;
  items: OrderItem[];
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

export async function saveOrder(
  items: CartItem[],
  options?: { status?: string; source?: string; tgUserId?: string | null; initData?: string }
): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('orders', {
      body: {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        status: options?.status ?? 'new',
        source: options?.source ?? 'web',
        tgUserId: options?.tgUserId ?? null,
        initData: options?.initData,
      },
    });

    if (error || !data?.orderId) {
      throw new Error(error?.message ?? 'Failed to create order');
    }

    return {
      success: true,
      orderId: data.orderId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function fetchOrders(): Promise<{
  orders: Order[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(
        'id,total_price,created_at,status,source,tg_user_id,order_items(id,quantity,price,product:products(id,name))'
      )
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const orders = (data || []).map((order) => ({
      id: order.id,
      total_price: order.total_price,
      created_at: order.created_at,
      status: order.status,
      source: order.source,
      tg_user_id: order.tg_user_id,
      items: order.order_items || [],
    }));

    return { orders };
  } catch (err) {
    return {
      orders: [],
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function createCategory(name: string): Promise<{
  success: boolean;
  category?: Category;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create category');
    }

    return { success: true, category: data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function updateCategory(
  id: string,
  name: string
): Promise<{
  success: boolean;
  category?: Category;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to update category');
    }

    return { success: true, category: data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function deleteCategory(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      throw new Error('Failed to delete category');
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function createProduct(input: Omit<Product, 'id'>): Promise<{
  success: boolean;
  product?: Product;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([input])
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create product');
    }

    return { success: true, product: data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function updateProduct(input: Product): Promise<{
  success: boolean;
  product?: Product;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: input.name,
        price: input.price,
        category_id: input.category_id,
      })
      .eq('id', input.id)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to update product');
    }

    return { success: true, product: data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function deleteProduct(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw new Error('Failed to delete product');
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
