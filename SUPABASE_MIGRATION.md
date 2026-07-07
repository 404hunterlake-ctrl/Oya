# Supabase Migration Guide

## Overview

Oya has been successfully migrated from Prisma SQLite to **Supabase PostgreSQL** with the following improvements:

- ✅ Built-in authentication (replaces bcryptjs + JWT)
- ✅ File storage for avatars
- ✅ Row Level Security (RLS) for data protection
- ✅ Real-time subscriptions for live updates
- ✅ All security audit issues fixed
- ✅ Input validation with Zod
- ✅ Rate limiting
- ✅ Error handling improvements

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose a name, password, and region
5. Wait for project to initialize (~2 mins)

### 2. Get API Keys

1. Go to **Project Settings > API**
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APP_URL=http://localhost:3000
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
```

### 4. Install Dependencies

```bash
npm install @supabase/supabase-js
npm install zod  # For validation
```

### 5. Create Database Tables

Go to **Supabase Dashboard > SQL Editor** and run:

```sql
-- Users table (managed by Supabase Auth)
-- Supabase automatically creates this

-- Sabi Profiles
CREATE TABLE sabi_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  rating FLOAT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  hourly_rate INTEGER DEFAULT 0,
  bio TEXT DEFAULT '',
  completed_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  sabi_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  price INTEGER DEFAULT 0,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT DEFAULT 'paystack',
  reference TEXT UNIQUE,
  transaction_id TEXT,
  metadata JSONB,
  failure_reason TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_jobs_client ON jobs(client_id);
CREATE INDEX idx_jobs_sabi ON jobs(sabi_id);
CREATE INDEX idx_payments_job ON payments(job_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_reviews_job ON reviews(job_id);

-- Enable Row Level Security (RLS)
ALTER TABLE sabi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sabi_profiles
CREATE POLICY "Users can view all sabi profiles"
  ON sabi_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON sabi_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for jobs
CREATE POLICY "Users can view public jobs"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Clients can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = client_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reviews
CREATE POLICY "Users can view all reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);
```

### 6. Set Up File Storage

Go to **Supabase Dashboard > Storage**:

1. Click "New Bucket"
2. Name: `avatars`
3. Make public (Allow public access)
4. Click "Create Bucket"

### 7. Configure Authentication

Go to **Authentication > Providers**:

1. Enable Email
2. Set email confirmation required (or not, your choice)
3. Under "Email Templates", customize if needed

### 8. Deploy to Vercel

```bash
# Set environment variables in Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add PAYSTACK_SECRET_KEY
vercel env add PAYSTACK_WEBHOOK_SECRET

# Deploy
vercel deploy --prod
```

---

## Security Fixes Applied

### ✅ Critical Issues Fixed

1. **JWT_SECRET Fallback Removed**
   - Now uses Supabase auth (no hardcoded secrets)
   - Environment validation at startup

2. **`.env.local` Removed from Git**
   - Never commit environment files
   - Use Vercel environment variables

3. **Webhook Signature Verification Fixed**
   - Proper crypto import
   - Enforced signature validation
   - Error thrown on invalid signatures

### ✅ High Priority Issues Fixed

4. **Input Validation**
   - All API routes use Zod schemas
   - Type-safe request/response handling

5. **Prisma Client Caching**
   - Not needed with Supabase (serverless)
   - No connection pooling issues

6. **Error Handling**
   - Proper error propagation
   - No orphaned records creation
   - Client doesn't expose DB errors

7. **Rate Limiting**
   - Implemented on payment endpoints
   - Configurable limits

8. **Environment Validation**
   - `lib/config.ts` validates all required vars
   - Throws error at startup if missing

---

## API Changes

### Old (Prisma)
```typescript
const user = await prisma.user.create({
  data: { email, passwordHash: await hashPassword(password) }
});
```

### New (Supabase)
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password
});
```

---

## File Upload (Avatars)

```typescript
import { supabase } from '@/lib/supabase';

// Upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file);

// Get URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`);
```

---

## Real-time Subscriptions

```typescript
// Subscribe to new jobs
const subscription = supabase
  .from('jobs')
  .on('INSERT', (payload) => {
    console.log('New job:', payload.new);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## Troubleshooting

### "Missing required environment variables"
- Check `.env.local` has all required vars
- Restart dev server after adding env vars

### "Unauthorized" errors
- Ensure user is authenticated
- Check token is being passed in `Authorization` header

### RLS errors
- Check RLS policies are enabled
- Verify user has permission for operation

### File upload fails
- Ensure `avatars` bucket is public
- Check file size < 5MB

---

## Next Steps

1. ✅ Test authentication (sign up/login)
2. ✅ Test payments
3. ✅ Test file uploads
4. ✅ Test real-time subscriptions
5. ✅ Deploy to Vercel
6. ✅ Monitor for errors

---

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
