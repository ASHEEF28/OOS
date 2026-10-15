import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gwemjmpsbqqybkrgxceg.supabase.co';

export function getSupabaseUrl(): string {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    localStorage.getItem('opportunity_os_supabase_url') ||
    DEFAULT_SUPABASE_URL
  );
}

export function getSupabaseAnonKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem('opportunity_os_supabase_anon_key') ||
    ''
  );
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (url) localStorage.setItem('opportunity_os_supabase_url', url);
  if (anonKey) localStorage.setItem('opportunity_os_supabase_anon_key', anonKey);
  window.dispatchEvent(new Event('opportunityos:supabase-updated'));
}

export const isSupabaseConfigured = Boolean(
  getSupabaseUrl() &&
  getSupabaseAnonKey() &&
  getSupabaseUrl().startsWith('http') &&
  !getSupabaseUrl().includes('placeholder') &&
  getSupabaseAnonKey().trim().length > 10
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Check if the current user session is authenticated via Supabase.
 * Returns null gracefully when Supabase is unconfigured or in demo mode.
 */
export async function getAuthSession() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session;
  } catch (err) {
    console.warn('Supabase auth session check failed:', err);
    return null;
  }
}

/**
 * Test connectivity to the configured Supabase instance
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. Please provide both.',
    };
  }

  try {
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.auth.getSession();
    if (error) {
      return { success: false, message: `Auth error: ${error.message}` };
    }
    return { success: true, message: `Connected to Supabase project (${url}) successfully!` };
  } catch (err: any) {
    return { success: false, message: `Connection failed: ${err.message}` };
  }
}
