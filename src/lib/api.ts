export const api = {
  menu: {
    fetch: async () => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/categories`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    },
  },
};
