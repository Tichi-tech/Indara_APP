-- Check how many tracks are missing audio URLs
SELECT
  COUNT(*) as total_tracks,
  COUNT(audio_url) as tracks_with_url,
  COUNT(*) - COUNT(audio_url) as tracks_missing_url
FROM generated_tracks;

-- Show recent tracks without audio URLs
SELECT
  id,
  title,
  created_at,
  audio_url,
  status,
  error_message
FROM generated_tracks
WHERE audio_url IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- Check if there's a jobs table showing generation status
SELECT
  j.id,
  j.status,
  j.error_message,
  j.created_at,
  gt.title,
  gt.audio_url
FROM jobs j
LEFT JOIN generated_tracks gt ON j.id = gt.job_id
WHERE gt.audio_url IS NULL
ORDER BY j.created_at DESC
LIMIT 10;
