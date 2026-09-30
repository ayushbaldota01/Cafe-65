import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ozgnhfsveibggugoohbd.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cd10rUGNZCm84UVT95ZxYA_sUPowqjy';

export const supabase = createClient(supabaseUrl, supabaseKey);
