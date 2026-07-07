/**
 * Environment configuration with validation
 * Ensures all required env vars are set at startup
 */

interface Config {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  paystackPublicKey?: string;
  paystackSecretKey?: string;
  paystackWebhookSecret?: string;
  appUrl: string;
  nodeEnv: string;
  paymentEnabled: boolean;
  rateLimitEnabled: boolean;
}

function validateEnv(): Config {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'APP_URL',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Please check your .env.local file.`
    );
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
    appUrl: process.env.APP_URL!,
    nodeEnv: process.env.NODE_ENV || 'development',
    paymentEnabled: process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true',
    rateLimitEnabled: process.env.NEXT_PUBLIC_RATE_LIMIT_ENABLED === 'true',
  };
}

export const config = validateEnv();
