import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const MISSING_ENV_ERROR_MESSAGE =
  'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY';

function readSupabaseEnv(): { supabaseUrl: string; supabaseAnonKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(MISSING_ENV_ERROR_MESSAGE);
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Client for browser (anon key).
// The real client is created on first use instead of at module scope so that
// importing this module never throws. `next build` imports every route module
// while collecting page data, so a module-scope `createClient` would crash the
// build whenever the Supabase environment variables are not configured.
let browserClient: SupabaseClient<Database> | null = null;
const boundMethods = new Map<string, (...args: unknown[]) => unknown>();

function getBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    const { supabaseUrl, supabaseAnonKey } = readSupabaseEnv();

    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    boundMethods.clear();
  }

  return browserClient;
}

// Lazy proxy: forwards every access to the real client, creating it on first
// access. Methods are bound to the real client so `supabase.from(...)` and
// `supabase.auth.getUser()` keep their `this` context.
export const supabase: SupabaseClient<Database> = new Proxy(
  Object.create(SupabaseClient.prototype) as SupabaseClient<Database>,
  {
    get(_target, property) {
      // Symbol lookups (e.g. util.inspect, Symbol.toStringTag) must not
      // instantiate the client.
      if (typeof property === 'symbol') {
        return undefined;
      }

      const client = getBrowserClient();

      const cached = boundMethods.get(property);
      if (cached) {
        return cached;
      }

      const value: unknown = Reflect.get(client, property);

      if (typeof value === 'function') {
        const bound = (value as (...args: unknown[]) => unknown).bind(client);
        boundMethods.set(property, bound);

        return bound;
      }

      return value;
    },
  }
);

// Client for server-only operations (service role key)
export function getSupabaseAdmin() {
  const { supabaseUrl } = readSupabaseEnv();
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured for admin operations');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type { Database };
