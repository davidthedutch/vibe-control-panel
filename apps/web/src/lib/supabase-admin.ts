import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase admin credentials not found. Server-side queries will fail.');
}

// Server-side only client — bypasses RLS
// NEVER import this in client components
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
