-- Combined Migrations for Calor-X project lurcmwqvgjfsfzsmvkne
-- Generated: 03/07/2026 15:20:34



-- ==========================================
-- Migration: 20251027170040_f5eb6833-7215-46b1-94a1-39e9b8ba0f1a.sql
-- ==========================================

-- Create storage bucket for food images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'food-images',
  'food-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Migration: 20251028080629_b55949c3-a076-427c-b2f5-964bb65908dd.sql
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public upload of food images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read of food images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own food images" ON storage.objects;

-- Create truly public policies for food-images bucket
CREATE POLICY "Public upload to food-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'food-images');

CREATE POLICY "Public read from food-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'food-images');

CREATE POLICY "Public delete from food-images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'food-images');

-- ==========================================
-- Migration: 20251029110035_8371ea09-6771-4dd8-9049-d91c89b9394e.sql
-- ==========================================

-- Create profiles table for user data and goals
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  height_cm DECIMAL,
  weight_kg DECIMAL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  health_goal TEXT CHECK (health_goal IN ('lose_weight', 'gain_muscle', 'maintain_weight')),
  dietary_preferences TEXT[],
  allergies TEXT[],
  language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en', 'fr')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_goals table for macro targets
CREATE TABLE IF NOT EXISTS public.daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories_target DECIMAL NOT NULL,
  protein_g_target DECIMAL NOT NULL,
  carbs_g_target DECIMAL NOT NULL,
  fat_g_target DECIMAL NOT NULL,
  fiber_g_target DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create meal_logs table for scanned meals
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  dish_name_ar TEXT,
  image_url TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  confidence_score DECIMAL,
  calories DECIMAL NOT NULL,
  protein_g DECIMAL NOT NULL,
  carbs_g DECIMAL NOT NULL,
  fat_g DECIMAL NOT NULL,
  fiber_g DECIMAL,
  sugar_g DECIMAL,
  sodium_mg DECIMAL,
  vitamins_minerals JSONB,
  ingredients JSONB,
  ai_feedback TEXT,
  portion_adjustment DECIMAL DEFAULT 1.0,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_nutrition table for aggregated daily totals
CREATE TABLE IF NOT EXISTS public.daily_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_calories DECIMAL DEFAULT 0,
  total_protein_g DECIMAL DEFAULT 0,
  total_carbs_g DECIMAL DEFAULT 0,
  total_fat_g DECIMAL DEFAULT 0,
  total_fiber_g DECIMAL DEFAULT 0,
  total_sugar_g DECIMAL DEFAULT 0,
  total_sodium_mg DECIMAL DEFAULT 0,
  meals_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_nutrition ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for daily_goals
CREATE POLICY "Users can view own goals" ON public.daily_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.daily_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.daily_goals FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for meal_logs
CREATE POLICY "Users can view own meals" ON public.meal_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON public.meal_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON public.meal_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON public.meal_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_nutrition
CREATE POLICY "Users can view own daily nutrition" ON public.daily_nutrition FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily nutrition" ON public.daily_nutrition FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily nutrition" ON public.daily_nutrition FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_daily_goals BEFORE UPDATE ON public.daily_goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_daily_nutrition BEFORE UPDATE ON public.daily_nutrition FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- Migration: 20251030115328_5cfe4acd-097a-49e6-8989-6569ccbfd892.sql
-- ==========================================

-- Create image analysis cache table
CREATE TABLE public.image_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_hash TEXT NOT NULL,
  image_url TEXT,
  result_json JSONB NOT NULL,
  analysis_version TEXT NOT NULL DEFAULT 'v1.0.0',
  detection_model_version TEXT NOT NULL DEFAULT 'google/gemini-2.5-pro',
  confidence_score NUMERIC,
  corrections_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user corrections table
CREATE TABLE public.user_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cache_id UUID REFERENCES public.image_analysis_cache(id) ON DELETE CASCADE,
  original_result JSONB NOT NULL,
  corrected_result JSONB NOT NULL,
  correction_type TEXT NOT NULL, -- 'weight_edit', 'ingredient_edit', 'portion_change'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.image_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_corrections ENABLE ROW LEVEL SECURITY;

-- RLS policies for image_analysis_cache
CREATE POLICY "Users can view own cache"
  ON public.image_analysis_cache
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cache"
  ON public.image_analysis_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cache"
  ON public.image_analysis_cache
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for user_corrections
CREATE POLICY "Users can view own corrections"
  ON public.user_corrections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own corrections"
  ON public.user_corrections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for fast hash lookups
CREATE INDEX idx_image_hash ON public.image_analysis_cache(image_hash);
CREATE INDEX idx_user_cache ON public.image_analysis_cache(user_id, created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_image_cache_updated_at
  BEFORE UPDATE ON public.image_analysis_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- Migration: 20260226_add_plan_to_profiles.sql
-- ==========================================

-- Add plan column to profiles table
-- Possible values: 'free', 'standard', 'pro'
-- Default: 'free' for all new users
-- Manually update to 'standard' or 'pro' in Supabase dashboard for paying users

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'standard', 'pro'));

-- Comment for documentation
COMMENT ON COLUMN public.profiles.plan IS 'User subscription plan: free, standard, or pro. Update manually or via Stripe webhook.';

-- ==========================================
-- Migration: 20260301_add_profile_fields.sql
-- ==========================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS fitness_level TEXT,
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[];

-- ==========================================
-- Migration: 20260305_add_onboarding.sql
-- ==========================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
