// Supabase REST API client - no SDK required
// This avoids all build-time dependency issues

interface SupabaseConfig {
  url: string;
  key: string;
}

class SupabaseREST {
  private url: string;
  private headers: HeadersInit;

  constructor(config: SupabaseConfig) {
    this.url = config.url;
    this.headers = {
      'apikey': config.key,
      'Authorization': `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    };
  }

  async from(table: string) {
    const baseUrl = `${this.url}/rest/v1/${table}`;

    return {
      select: async (columns = '*') => {
        try {
          const response = await fetch(baseUrl + `?select=${columns}`, {
            method: 'GET',
            headers: this.headers
          });
          const data = await response.json();
          return { data, error: response.ok ? null : data };
        } catch (error) {
          return { data: null, error };
        }
      },

      insert: async (values: any) => {
        try {
          const response = await fetch(baseUrl, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(values)
          });
          const data = response.ok && response.status !== 204 ? await response.json() : null;
          return { data, error: response.ok ? null : data };
        } catch (error) {
          return { data: null, error };
        }
      },

      eq: (column: string, value: any) => {
        const queryUrl = `${baseUrl}?${column}=eq.${value}`;
        return {
          single: async () => {
            try {
              const response = await fetch(queryUrl, {
                method: 'GET',
                headers: { ...this.headers, 'Accept': 'application/vnd.pgrst.object+json' }
              });
              const data = await response.json();
              return { data: response.ok ? data : null, error: response.ok ? null : data };
            } catch (error) {
              return { data: null, error };
            }
          },
          select: async (columns = '*') => {
            try {
              const response = await fetch(`${queryUrl}&select=${columns}`, {
                method: 'GET',
                headers: this.headers
              });
              const data = await response.json();
              return { data, error: response.ok ? null : data };
            } catch (error) {
              return { data: null, error };
            }
          }
        };
      }
    };
  }
}

export async function getSupabaseREST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase environment variables not configured');
    return null;
  }

  return new SupabaseREST({ url: supabaseUrl, key: supabaseKey });
}