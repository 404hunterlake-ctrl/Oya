import { type NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Public routes that don't require authentication
const PUBLIC_GET_ROUTES = [
  '/api/sabis',
  '/api/auth/callback',
];

const PUBLIC_GET_ROUTE_PREFIXES = [
  '/api/sabis/',
];

const PUBLIC_POST_ROUTES = [
  '/api/webhooks/paystack',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public GET routes
  if (
    method === 'GET' &&
    (PUBLIC_GET_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    ) ||
    PUBLIC_GET_ROUTE_PREFIXES.some(
      (prefix) => pathname.startsWith(prefix)
    ))
  ) {
    return NextResponse.next();
  }

  // Allow public POST routes (webhook)
  if (
    method === 'POST' &&
    PUBLIC_POST_ROUTES.some((route) => pathname === route)
  ) {
    return NextResponse.next();
  }

  // Require auth token for other routes
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized — no token provided' },
      { status: 401 }
    );
  }

  try {
    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized — invalid token' },
        { status: 401 }
      );
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', user.userId);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware auth error:', error);
    return NextResponse.json(
      { error: 'Unauthorized — invalid token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
