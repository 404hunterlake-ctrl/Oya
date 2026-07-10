/**
 * Paystack payment service
 */

import { config } from '@/lib/config';
import { createHmac } from 'crypto';

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
  data?: {
    reference: string;
    status: string;
    amount: number;
    paid_at: string;
  };
  message?: string;
}

export class PaystackService {
  private baseUrl = 'https://api.paystack.co';

  isEnabled(): boolean {
    return config.paymentEnabled && !!config.paystackPublicKey && !!config.paystackSecretKey;
  }

  async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
    if (!this.isEnabled()) {
      return {
        status: 'error',
        reference: '',
        message: 'Paystack is not configured',
      };
    }

    try {
      const amountInKobo = Math.round(params.amount * 100);
      const reference = `OYA_${params.jobId}_${params.userId}_${Date.now()}`;

      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.email,
          amount: amountInKobo,
          reference,
          metadata: {
            jobId: params.jobId,
            userId: params.userId,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        return {
          status: 'error',
          reference: '',
          message: data.message || 'Payment initialization failed',
        };
      }

      return {
        status: 'success',
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
      };
    } catch (error) {
      console.error('Paystack initialization error:', error);
      return {
        status: 'error',
        reference: '',
        message: 'Payment initialization failed',
      };
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    if (!this.isEnabled()) {
      return {
        status: 'error',
        message: 'Paystack is not configured',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${params.reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.paystackSecretKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
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
      console.error('Paystack verification error:', error);
      return {
        status: 'error',
        message: 'Payment verification failed',
      };
    }
  }

  verifyWebhookSignature(signature: string, body: string): boolean {
    if (!config.paystackWebhookSecret) {
      console.warn('PAYSTACK_WEBHOOK_SECRET not configured — skipping signature verification');
      return true;
    }

    try {
      const hash = createHmac('sha512', config.paystackWebhookSecret).update(body).digest('hex');
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }
}

export const paystackService = new PaystackService();
