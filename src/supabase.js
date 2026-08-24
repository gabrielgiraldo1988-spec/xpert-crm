import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hkgmipaexxtvxudyrntf.supabase.co'
const supabaseKey = 'sb_publishable_fJ4qU-sCaMddv-yD8zZG9w_M3nQdLrE'

export const supabase = createClient(supabaseUrl, supabaseKey)