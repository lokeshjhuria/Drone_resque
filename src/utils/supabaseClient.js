import { createClient } from '@supabase/supabase-js';

// Project: https://supabase.com/dashboard/project/hwhozwfaazlaqriiewko
export const SUPABASE_PROJECT_REF = 'hwhozwfaazlaqriiewko';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

// Retrieve anon key from environment variables or local station cache
export const getSupabaseAnonKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY.trim();
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('aerosar_supabase_anon_key')?.trim() || '';
  }
  return '';
};

export const setSupabaseAnonKey = (key) => {
  if (typeof localStorage !== 'undefined') {
    if (key) {
      localStorage.setItem('aerosar_supabase_anon_key', key.trim());
    } else {
      localStorage.removeItem('aerosar_supabase_anon_key');
    }
  }
};

let cachedClient = null;
let lastKeyUsed = null;

export const getSupabase = () => {
  const currentKey = getSupabaseAnonKey();
  
  if (cachedClient && lastKeyUsed === currentKey) {
    return cachedClient;
  }

  // Fallback placeholder token to allow initialization without throwing
  const key = currentKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';
  
  try {
    cachedClient = createClient(SUPABASE_URL, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    lastKeyUsed = currentKey;
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase] Client initialization warning:', err.message);
    return null;
  }
};

export const isSupabaseConfigured = () => {
  const key = getSupabaseAnonKey();
  return Boolean(key && key.length > 20 && !key.includes('placeholder'));
};

export default getSupabase;
