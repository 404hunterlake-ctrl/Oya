/**
 * Payment utilities
 */

import { config } from '@/lib/config';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePaymentAmount(amount: number): ValidationResult {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }

  const min = parseInt(process.env.NEXT_PUBLIC_MIN_PAYMENT || '500', 10);
  if (amount < min) {
    return { valid: false, error: `Minimum payment is ₦${min.toLocaleString()}` };
  }

  const max = parseInt(process.env.NEXT_PUBLIC_MAX_PAYMENT || '500000', 10);
  if (amount > max) {
    return { valid: false, error: `Maximum payment is ₦${max.toLocaleString()}` };
  }

  return { valid: true };
}

export function nairaToKobo(amount: number): number {
  return Math.round(amount * 100);
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}
