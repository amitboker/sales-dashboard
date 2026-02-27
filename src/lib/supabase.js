import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yijomhtugowhrnrrbyzy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpam9taHR1Z293aHJucnJieXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTM0NjAsImV4cCI6MjA4NTg4OTQ2MH0.nf7D3kO3cuZwLXWvvsYPv9DLQoRCw6ObQc4a-n_dL_U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
