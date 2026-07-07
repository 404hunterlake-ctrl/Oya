/**
 * POST /api/auth/login
 * Sign in with email and password
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SignInSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const { email, password } = SignInSchema.parse(body);

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: data.user,
        session: data.session,
        message: 'Sign in successful',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
