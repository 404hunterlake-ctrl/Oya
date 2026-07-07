/**
 * Simple in-memory rate limiting
 * For production, use Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

export function rateLimit(identifier: string, limit = MAX_REQUESTS): boolean {
  const now = Date.now();
  const entry = rateLimits.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_SIZE,
    });
    return true;
  }

  if (entry.count < limit) {
    entry.count++;
    return true;
  }

  return false;
}

export function getRateLimitRemaining(identifier: string): number {
  const entry = rateLimits.get(identifier);
  if (!entry || Date.now() > entry.resetTime) {
    return MAX_REQUESTS;
  }
  return Math.max(0, MAX_REQUESTS - entry.count);
}
