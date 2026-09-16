import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_REF = 'hwhozwfaazlaqriiewko';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

const getEnvKey = () => {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();
};

let serverClient = null;

export const getServerSupabase = () => {
  const key = getEnvKey() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

  if (!serverClient) {
    try {
      serverClient = createClient(SUPABASE_URL, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });
    } catch (err) {
      console.warn('[Supabase Server] Initialization note:', err.message);
    }
  }

  return serverClient;
};

export const isServerSupabaseReady = () => {
  const key = getEnvKey();
  return Boolean(key && key.length > 20 && !key.includes('placeholder'));
};

export default getServerSupabase;
