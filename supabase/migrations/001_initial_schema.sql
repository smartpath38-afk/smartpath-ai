-- ============================================================
-- SMARTPATH AI — Initial Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL CHECK (plan_name IN ('essential', 'pro', 'business', 'infinity')),
  plan_duration TEXT NOT NULL CHECK (plan_duration IN ('6m', '1y', '2y', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  monthly_render_limit INTEGER NOT NULL,
  expires_at TIMESTAMPTZ,
  gateway TEXT NOT NULL CHECK (gateway IN ('payop', 'paypal', 'dodo')),
  gateway_payment_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via webhooks)
-- No INSERT/UPDATE policies for authenticated users

-- ============================================================
-- 3. RENDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  style TEXT NOT NULL CHECK (style IN (
    'cartoon_3d', 'anime', 'oil_painting', 'cyberpunk',
    'watercolor', 'realistic_portrait', 'sketch', 'fantasy'
  )),
  input_image_url TEXT NOT NULL,
  output_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for fast render count queries
CREATE INDEX IF NOT EXISTS renders_user_id_idx ON public.renders(user_id);
CREATE INDEX IF NOT EXISTS renders_created_at_idx ON public.renders(created_at);
CREATE INDEX IF NOT EXISTS renders_user_created_idx ON public.renders(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.renders ENABLE ROW LEVEL SECURITY;

-- Users can view their own renders
CREATE POLICY "Users can view their own renders"
  ON public.renders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own renders (API Route will do this)
CREATE POLICY "Users can insert their own renders"
  ON public.renders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own renders (for status updates)
CREATE POLICY "Users can update their own renders"
  ON public.renders FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. HELPER FUNCTION: GET ACTIVE SUBSCRIPTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  plan_name TEXT,
  plan_duration TEXT,
  monthly_render_limit INTEGER,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.plan_name,
    s.plan_duration,
    s.monthly_render_limit,
    s.expires_at
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

-- ============================================================
-- 6. HELPER FUNCTION: COUNT MONTHLY RENDERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.count_monthly_renders(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  render_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO render_count
  FROM public.renders
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days'
    AND status != 'failed';
  RETURN render_count;
END;
$$;
