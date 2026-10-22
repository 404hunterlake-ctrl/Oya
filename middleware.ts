import { type NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_GET_ROUTES = [
  '/api/health',
  '/api/sabis',
  '/api/auth/callback',
];

const PUBLIC_POST_ROUTES = [
  '/api/webhooks/paystack',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (
    method === 'GET' &&
    PUBLIC_GET_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    )
  ) {
    return NextResponse.next();
  }

  if (
    method === 'POST' &&
    PUBLIC_POST_ROUTES.some((route) => pathname === route)
  ) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized — no token provided' },
      { status: 401 }
    );
  }

  try {
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized — invalid token' },
        { status: 401 }
      );
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);

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
