// Holds project environment variables and initializes Supabase client
export const SUPABASE_URL = 'https://pxdhzcyqowjzajzonbrg.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_E0ntVU7jinbs15nOGaH2CQ_OnvOcMOr';

// Global Supabase client instance
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
