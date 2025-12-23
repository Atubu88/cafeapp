import { supabase } from './db';

export const api = {
  health: {
    check: async () => {
      const { data, error } = await supabase
        .from('health_check')
        .select('*')
        .limit(1)
        .maybeSingle();

      return { data, error };
    },
  },
};
