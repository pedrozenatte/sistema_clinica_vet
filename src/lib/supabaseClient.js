import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL) {
  throw new Error('Variável SUPABASE_URL não definida. Configure seu .env.');
}

const key = SUPABASE_SERVICE_ROLE || SUPABASE_ANON_KEY;

if (!key) {
  throw new Error('Defina SUPABASE_SERVICE_ROLE (recomendado) ou SUPABASE_ANON_KEY.');
}

export const supabase = createClient(SUPABASE_URL, key, {
  auth: {
    persistSession: false,
  },
});
