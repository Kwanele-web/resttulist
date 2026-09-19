// Shared Supabase configuration for the modular menu feature.
export const SUPABASE_URL = 'https://pxdhzcyqowjzajzonbrg.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_E0ntVU7jinbs15nOGaH2CQ_OnvOcMOr';

// The CDN script is loaded by index.html before the legacy scripts and modules.
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
