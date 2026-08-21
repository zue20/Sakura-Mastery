import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://unxiqyjpgecctedgrtzd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_A3BCvZxOP8Ho4zlPhRMHZw_jT7Hv2Lx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});