-- Add plan column to profiles table
-- Possible values: 'free', 'standard', 'pro'
-- Default: 'free' for all new users
-- Manually update to 'standard' or 'pro' in Supabase dashboard for paying users

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'standard', 'pro'));

-- Comment for documentation
COMMENT ON COLUMN public.profiles.plan IS 'User subscription plan: free, standard, or pro. Update manually or via Stripe webhook.';
