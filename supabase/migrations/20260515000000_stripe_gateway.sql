-- Update gateway constraint to include stripe
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_gateway_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_gateway_check
  CHECK (gateway IN ('payop', 'paypal', 'dodo', 'stripe'));

-- Update plan_name constraint to include new Stripe plan names
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_name_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_name_check
  CHECK (plan_name IN ('essential', 'pro', 'business', 'infinity', 'starter', 'enterprise'));

-- Update plan_duration constraint to include monthly
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_duration_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_duration_check
  CHECK (plan_duration IN ('6m', '1y', '2y', 'lifetime', 'monthly'));

-- Update activate_subscription to handle new plan names and monthly duration
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
    WHEN 'starter'    THEN 50
    WHEN 'pro'        THEN 200
    WHEN 'enterprise' THEN 1000
    WHEN 'essential'  THEN 150
    WHEN 'business'   THEN 1500
    WHEN 'infinity'   THEN 3000
    ELSE 0
  END;

  v_expires_at := CASE p_plan_duration
    WHEN 'monthly'  THEN NOW() + INTERVAL '1 month'
    WHEN '6m'       THEN NOW() + INTERVAL '6 months'
    WHEN '1y'       THEN NOW() + INTERVAL '12 months'
    WHEN '2y'       THEN NOW() + INTERVAL '24 months'
    WHEN 'lifetime' THEN NULL
    ELSE NOW() + INTERVAL '1 month'
  END;

  UPDATE public.subscriptions
    SET status = 'cancelled'
    WHERE user_id = p_user_id AND status = 'active';

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
