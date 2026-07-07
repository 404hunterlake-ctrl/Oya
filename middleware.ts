import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Public routes that don't require authentication
const PUBLIC_GET_ROUTES = [
  '/api/sabis',
  '/api/auth/callback',
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
    PUBLIC_GET_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    )
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
    const supabase = getSupabaseAdmin();

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(token);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized — invalid token' },
        { status: 401 }
      );
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email || '');

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
