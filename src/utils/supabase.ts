import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_su;
const supabaseKey = import.meta.env.VITE_sak;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
