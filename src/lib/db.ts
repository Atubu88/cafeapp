import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HealthCheck {
  id: string;
  status: string;
  created_at: string;
}

export async function testDatabaseConnection(): Promise<{
  success: boolean;
  message: string;
  data?: HealthCheck[];
}> {
  try {
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        message: `Database error: ${error.message}`,
      };
    }

    return {
      success: true,
      message: data?.status || 'Database connected successfully',
      data: data ? [data] : [],
    };
  } catch (err) {
    return {
      success: false,
      message: `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}
