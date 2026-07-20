// Initialize and export the Supabase Client
const supabaseUrl = 'https://idezcpmhhgltuskvtpri.supabase.co';
const supabaseKey = 'sb_publishable_E0ntVU7jinbs15nOGaH2CQ_OnvOcMOr';

// Create the supabase client instance
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Make it globally accessible for our other modular scripts
window.supabaseClient = supabase;
