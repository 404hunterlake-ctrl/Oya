import { config } from '@/lib/config';
import { createHmac, timingSafeEqual, randomUUID } from 'crypto';

export interface InitializePaymentParams {
  email: string;
  amount: number;
  jobId: string;
  userId: string;
}

export interface InitializePaymentResult {
  status: 'success' | 'error';
  reference: string;
  authorizationUrl?: string;
  accessCode?: string;
  message?: string;
}

export interface VerifyPaymentParams {
  reference: string;
}

export interface VerifyPaymentResult {
  status: 'success' | 'error';
  data?: { reference: string; status: string; amount: number; paid_at: string };
  message?: string;
}

export class PaystackService {
  private baseUrl = 'https://api.paystack.co';

  /**
   * Whether Paystack is configured and can be used for live payments
   */
  isEnabled(): boolean {
    return Boolean(config.paystackSecretKey);
  }

  async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
    if (!config.paystackSecretKey) {
      return { status: 'error', reference: '', message: 'Paystack is not configured' };
    }

    const reference = `oya_${Date.now()}_${randomUUID()}`;

    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.email,
          amount: Math.round(params.amount * 100),
          currency: 'NGN',
          reference,
          callback_url: `${config.appUrl}/api/payments/verify`,
          metadata: { job_id: params.jobId, user_id: params.userId },
        }),
      });

      const data = (await response.json()) as {
        status: boolean;
        message?: string;
        data?: { reference: string; authorization_url: string; access_code: string };
      };

      if (!response.ok || data.status !== true || !data.data) {
        return {
          status: 'error',
          reference,
          message: data.message || 'Failed to initialize payment',
        };
      }

      return {
        status: 'success',
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize payment';
      console.error('Paystack initialization error:', error);
      return { status: 'error', reference, message };
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    if (!config.paystackSecretKey) {
      return { status: 'error', message: 'Paystack is not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${params.reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json()) as {
        status: boolean;
        message?: string;
        data?: { reference: string; status: string; amount: number; paid_at: string };
      };

      if (!response.ok || data.status !== true || !data.data || data.data.status !== 'success') {
        return {
          status: 'error',
          message: data.message || 'Failed to verify payment',
        };
      }

      return {
        status: 'success',
        data: {
          reference: data.data.reference,
          status: data.data.status,
          amount: data.data.amount,
          paid_at: data.data.paid_at,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify payment';
      console.error('Paystack verify error:', error);
      return { status: 'error', message };
    }
  }

  verifyWebhookSignature(signature: string, body: string): boolean {
    const secret = config.paystackWebhookSecret;
    if (!secret) {
      console.warn('Paystack webhook secret is not configured');
      return config.nodeEnv !== 'production';
    }

    const hash = createHmac('sha512', secret).update(body).digest('hex');
    try {
      const hashBuf = Buffer.from(hash, 'utf8');
      const sigBuf = Buffer.from(signature, 'utf8');
      if (hashBuf.length !== sigBuf.length) return false;
      return timingSafeEqual(hashBuf, sigBuf);
    } catch {
      return false;
    }
  }
}

export const paystackService = new PaystackService();
