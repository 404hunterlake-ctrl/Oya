/**
 * Authentication helper functions for Supabase
 */

import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import type { NextRequest } from 'next/server';

/**
 * Get the current user from Supabase auth
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get user from request headers (set by middleware)
 */
export function getUserFromRequest(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userEmail = req.headers.get('x-user-email');

  if (!userId) return null;

  return {
    id: userId,
    email: userEmail || '',
  };
}

/**
 * Verify JWT token (for server-side)
 */
export async function verifyToken(token: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.admin.getUserById(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : 'Sign in failed',
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, any>
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : 'Sign up failed',
    };
  }
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Sign out failed',
    };
  }
}
