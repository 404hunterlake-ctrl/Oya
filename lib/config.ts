/**
 * Environment configuration with validation
 * Resolves each property independently so importing this module never throws.
 * Only `appUrl` is required; all other variables are optional and validated
 * (where applicable) on first access of the relevant property.
 */

interface Config {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceKey?: string;
  paystackPublicKey?: string;
  paystackSecretKey?: string;
  paystackWebhookSecret?: string;
  appUrl: string;
  nodeEnv: string;
  paymentEnabled: boolean;
  rateLimitEnabled: boolean;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function resolve(property: string): unknown {
  switch (property) {
    case 'supabaseUrl':
      return process.env.NEXT_PUBLIC_SUPABASE_URL;
    case 'supabaseAnonKey':
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    case 'supabaseServiceKey':
      return process.env.SUPABASE_SERVICE_ROLE_KEY;
    case 'paystackPublicKey':
      return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    case 'paystackSecretKey':
      return process.env.PAYSTACK_SECRET_KEY;
    case 'paystackWebhookSecret':
      return process.env.PAYSTACK_WEBHOOK_SECRET;
    case 'appUrl':
      return required('APP_URL');
    case 'nodeEnv':
      return process.env.NODE_ENV || 'development';
    case 'paymentEnabled':
      return process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';
    case 'rateLimitEnabled':
      return process.env.NEXT_PUBLIC_RATE_LIMIT_ENABLED === 'true';
    default:
      return undefined;
  }
}

export const config: Config = new Proxy({} as Config, {
  get(_target, property) {
    // Symbol lookups (e.g. util.inspect, Symbol.toStringTag) must not
    // trigger resolution.
    if (typeof property === 'symbol') {
      return undefined;
    }

    return resolve(property);
  },
});
