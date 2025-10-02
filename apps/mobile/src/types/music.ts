export type Track = {
  id: string;
  title: string;
  artist: string;
  image_url?: string | null;
  audio_url?: string;
  audio_path?: string;
  duration_ms?: number | null;
};
