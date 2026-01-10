import { createClient } from '@supabase/supabase-js';

/**
 * Shared Supabase client for server routes.
 * Uses service key for full database access.
 */
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);
