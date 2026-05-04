-- ============================================================
-- SMARTPATH AI — Complete Database Migration
-- Run once on a brand-new Supabase project.
-- ============================================================

-- ─── TABLES ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name            TEXT NOT NULL CHECK (plan_name IN ('essential', 'pro', 'business', 'infinity')),
  plan_duration        TEXT NOT NULL CHECK (plan_duration IN ('6m', '1y', '2y', 'lifetime')),
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  monthly_render_limit INTEGER NOT NULL DEFAULT 0,
  expires_at           TIMESTAMPTZ,
  gateway              TEXT NOT NULL CHECK (gateway IN ('payop', 'paypal', 'dodo')),
  gateway_payment_id   TEXT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.renders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style            TEXT NOT NULL CHECK (style IN ('cartoon_3d', 'anime', 'oil_painting', 'cyberpunk', 'watercolor', 'realistic_portrait', 'sketch', 'fantasy')),
  input_image_url  TEXT NOT NULL,
  output_image_url TEXT,
  status           TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guest_orders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL,
  plan       TEXT NOT NULL,
  duration   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_orders  ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- renders
CREATE POLICY "Users can view own renders"
  ON public.renders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own renders"
  ON public.renders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own renders"
  ON public.renders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own renders"
  ON public.renders FOR DELETE
  USING (auth.uid() = user_id);

-- guest_orders: no client access (service role only via admin client)

-- ─── FUNCTIONS ──────────────────────────────────────────────

-- Auto-create profile row when a new user signs up
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Return the user's current active subscription (if any)
CREATE OR REPLACE FUNCTION public.get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  id                   UUID,
  plan_name            TEXT,
  plan_duration        TEXT,
  status               TEXT,
  monthly_render_limit INTEGER,
  expires_at           TIMESTAMPTZ,
  gateway              TEXT,
  gateway_payment_id   TEXT,
  created_at           TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, plan_name, plan_duration, status, monthly_render_limit,
         expires_at, gateway, gateway_payment_id, created_at
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Count completed renders in the last 30 days
CREATE OR REPLACE FUNCTION public.count_monthly_renders(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.renders
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND created_at > NOW() - INTERVAL '30 days';
$$;

-- Cancel old subscription and activate new one (called by payment webhooks)
CREATE OR REPLACE FUNCTION public.activate_subscription(
  p_user_id       UUID,
  p_plan_name     TEXT,
  p_plan_duration TEXT,
  p_gateway       TEXT,
  p_payment_id    TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_render_limit INTEGER;
  v_expires_at   TIMESTAMPTZ;
BEGIN
  v_render_limit := CASE p_plan_name
    WHEN 'essential' THEN 150
    WHEN 'pro'       THEN 450
    WHEN 'business'  THEN 1500
    WHEN 'infinity'  THEN 3000
    ELSE 0
  END;

  v_expires_at := CASE p_plan_duration
    WHEN '6m'       THEN NOW() + INTERVAL '6 months'
    WHEN '1y'       THEN NOW() + INTERVAL '12 months'
    WHEN '2y'       THEN NOW() + INTERVAL '24 months'
    WHEN 'lifetime' THEN NULL
    ELSE NOW() + INTERVAL '1 month'
  END;

  -- Cancel any currently active subscription
  UPDATE public.subscriptions
  SET status = 'cancelled'
  WHERE user_id = p_user_id AND status = 'active';

  -- Insert the new active subscription
  INSERT INTO public.subscriptions (
    user_id, plan_name, plan_duration, status,
    monthly_render_limit, expires_at, gateway, gateway_payment_id
  )
  VALUES (
    p_user_id, p_plan_name, p_plan_duration, 'active',
    v_render_limit, v_expires_at, p_gateway, p_payment_id
  );
END;
$$;

-- ─── STORAGE BUCKETS ────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('inputs',  'inputs',  false, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('renders', 'renders', true,  52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- inputs: authenticated users can only touch files in their own folder ({user_id}/...)
CREATE POLICY "inputs: users can upload to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'inputs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "inputs: users can read own files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'inputs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "inputs: users can delete own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'inputs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- renders: public read (output images are publicly shareable)
CREATE POLICY "renders: anyone can view"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'renders');
