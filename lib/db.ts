export type Role = 'client' | 'sabi' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  location: string;
  avatar?: string;
}

export interface SabiProfile {
  userId: string;
  skills: string[];
  rating: number;
  verified: boolean;
  hourlyRate: number;
  bio: string;
  completedJobs: number;
}

export type JobStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  clientId: string;
  sabiId: string;
  title: string;
  description: string;
  status: JobStatus;
  price: number;
  date: string;
}

// --- Auth helpers for client-side use ---

const TOKEN_KEY = 'oya_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- Auth API functions ---

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  location?: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
  }

  const result = await res.json();
  setToken(result.token);
  return result;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }

  const result = await res.json();
  setToken(result.token);
  return result;
}

export async function getCurrentUser(): Promise<(User & { sabiProfile?: SabiProfile | null }) | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      removeToken();
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

export function logout(): void {
  removeToken();
}

// --- Data API functions (replacing mock data) ---

export async function getSabis(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);

  const res = await fetch(`/api/sabis?${params.toString()}`);
  if (!res.ok) return [];

  const sabis = await res.json();
  return sabis as (User & { profile: SabiProfile })[];
}

export async function getSabiById(id: string) {
  const res = await fetch(`/api/sabis/${id}`);
  if (!res.ok) return null;
  return res.json() as Promise<User & { profile: SabiProfile }>;
}

export async function getJobs(userId?: string, role?: Role) {
  const params = new URLSearchParams();
  if (userId && role === 'client') params.set('clientId', userId);
  if (userId && role === 'sabi') params.set('sabiId', userId);

  const res = await fetch(`/api/jobs?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createJob(data: {
  sabiId: string;
  title: string;
  description?: string;
  price?: number;
  date?: string;
}) {
  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create job');
  }

  return res.json();
}

export async function acceptJob(jobId: string) {
  const res = await fetch(`/api/jobs/${jobId}/accept`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to accept job');
  }
  return res.json();
}

export async function completeJob(jobId: string) {
  const res = await fetch(`/api/jobs/${jobId}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to complete job');
  }
  return res.json();
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update job');
  }
  return res.json();
}

export async function createReview(data: {
  jobId: string;
  rating: number;
  comment?: string;
}) {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create review');
  }
  return res.json();
}

export async function verifySabi(sabiId: string, verified: boolean = true) {
  const res = await fetch(`/api/admin/sabis/${sabiId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ verified }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to verify sabi');
  }
  return res.json();
}

export async function getAllUsers() {
  const res = await fetch('/api/admin/users', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json() as Promise<(User & { sabiProfile?: SabiProfile | null })[]>;
}

// Legacy sync helpers that components still reference (return empty arrays initially)
// These are kept for backward compatibility but components should migrate to async versions
export const users: User[] = [];
export const sabiProfiles: SabiProfile[] = [];
export const jobs: Job[] = [];
