export interface ValidationResult { valid: boolean; error?: string; }

export function validatePaymentAmount(amount: number): ValidationResult {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  const min = Number(process.env.NEXT_PUBLIC_MIN_PAYMENT ?? '500');
  const max = Number(process.env.NEXT_PUBLIC_MAX_PAYMENT ?? '500000');
  if (amount < min) {
    return { valid: false, error: `Minimum payment is ₦${min.toLocaleString()}` };
  }
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
