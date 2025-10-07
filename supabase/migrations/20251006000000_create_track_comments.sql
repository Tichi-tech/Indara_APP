-- Create track_comments table
CREATE TABLE IF NOT EXISTS public.track_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.generated_tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Indexes for performance
  CONSTRAINT track_comments_comment_length CHECK (char_length(comment) >= 1 AND char_length(comment) <= 500)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_track_comments_track_id ON public.track_comments(track_id);
CREATE INDEX IF NOT EXISTS idx_track_comments_user_id ON public.track_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_track_comments_created_at ON public.track_comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.track_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.track_comments
  FOR SELECT
  USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert own comments"
  ON public.track_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.track_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.track_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_track_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER track_comments_updated_at
  BEFORE UPDATE ON public.track_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_track_comments_updated_at();
