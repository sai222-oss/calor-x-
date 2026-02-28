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