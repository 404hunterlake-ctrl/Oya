/**
 * POST /api/auth/register
 * Register a new user
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SignUpSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const { email, password, name, role } = SignUpSchema.parse(body);

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        user: data.user,
        message: 'Sign up successful. Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
