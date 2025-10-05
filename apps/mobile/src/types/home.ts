/**
 * Centralized type definitions for home screen features
 */

export type PlaylistItem = {
  id: string;
  title: string;
  description: string;
  image?: string;
  trackCount?: number;
  duration?: string;
};

export type CommunityTrack = {
  id: string;
  title: string;
  description: string;
  tags: string;
  duration?: string;
  audio_url?: string;
  creator?: string;
  image?: string;
};

export type TrackStats = {
  plays: number;
  likes: number;
};
