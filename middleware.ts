import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Public routes that don't require authentication
const PUBLIC_GET_ROUTES = [
  '/api/sabis',
  '/api/auth/login',
  '/api/auth/register',
];

const PUBLIC_POST_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public GET routes
  if (method === 'GET' && PUBLIC_GET_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Allow public POST routes
  if (method === 'POST' && PUBLIC_POST_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Check for auth token
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized — no token provided' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized — invalid token' }, { status: 401 });
  }

  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
