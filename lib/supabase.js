import { createClient } from '@supabase/supabase-js'

let _supabase = null

// Lazily created so `next build` (which imports this module to collect page
// data) never touches process.env or throws — the check only runs when a
// request actually calls a route that uses `supabase`.
export function getSupabase() {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  _supabase = createClient(supabaseUrl, supabaseKey)
  return _supabase
}

// Proxy so existing `supabase.from(...)` call sites keep working unchanged —
// the real client is only constructed on first property access at request time.
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      return getSupabase()[prop]
    },
  }
)
