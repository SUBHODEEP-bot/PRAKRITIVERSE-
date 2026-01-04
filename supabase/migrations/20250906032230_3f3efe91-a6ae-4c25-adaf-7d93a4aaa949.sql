-- Add location support to eco_challenges table
ALTER TABLE public.eco_challenges 
ADD COLUMN IF NOT EXISTS location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS location_lng NUMERIC,
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_radius_km INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS requires_location_verification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_photos_required BOOLEAN DEFAULT false;

-- Create table for challenge submissions with photo and location data
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID NOT NULL REFERENCES public.challenge_participations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.eco_challenges(id) ON DELETE CASCADE,
  submission_text TEXT,
  photo_urls JSONB DEFAULT '[]'::jsonb,
  submission_location_lat NUMERIC,
  submission_location_lng NUMERIC,
  submission_location_address TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on challenge_submissions
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge_submissions
CREATE POLICY "Users can view own submissions"
ON public.challenge_submissions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions"
ON public.challenge_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending submissions"
ON public.challenge_submissions
FOR UPDATE
USING (auth.uid() = user_id AND verification_status = 'pending');

CREATE POLICY "NGOs and admins can view and verify submissions"
ON public.challenge_submissions
FOR ALL
USING (
  has_role(auth.uid(), 'ngo'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.eco_challenges 
    WHERE id = challenge_submissions.challenge_id 
    AND created_by = auth.uid()
  )
);

-- Create storage bucket for challenge photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('challenge-photos', 'challenge-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for challenge photos
CREATE POLICY "Users can upload challenge photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'challenge-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own challenge photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'challenge-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Challenge creators can view submission photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'challenge-photos' AND
  EXISTS (
    SELECT 1 FROM public.challenge_submissions cs
    JOIN public.eco_challenges ec ON cs.challenge_id = ec.id
    WHERE cs.photo_urls::text LIKE '%' || name || '%'
    AND ec.created_by = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_location ON public.eco_challenges(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON public.challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.challenge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.challenge_submissions(verification_status);

-- Update trigger for challenge_submissions
CREATE TRIGGER update_challenge_submissions_updated_at
BEFORE UPDATE ON public.challenge_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();