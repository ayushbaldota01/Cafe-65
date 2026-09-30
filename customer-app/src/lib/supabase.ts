import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your Supabase Project URL and Anon Key
const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
