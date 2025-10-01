// Shared TypeScript interfaces for Indara AI

export type Screen =
  | 'welcome'
  | 'signin'
  | 'createAccount'
  | 'phoneNumber'
  | 'verification'
  | 'nameEntry'
  | 'onboardingComplete'
  | 'home'
  | 'createMusic'
  | 'mySongs'
  | 'songPlayer'
  | 'accountSettings'
  | 'profile'
  | 'notifications'
  | 'userProfile'
  | 'healingMusicPlaylist'
  | 'meditationPlaylist'
  | 'playlist'
  | 'analytics'
  | 'talkToDara'
  | 'meditationAssistant'
  | 'meditationCreation';

export interface Song {
  id: string;
  title: string;
  description: string;
  tags: string;
  plays: number;
  likes: number;
  image: string;
  version: string;
  isPublic: boolean;
  createdAt: string;
  creator?: string;
  isLiked?: boolean;
  duration?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: number;
  audio_url: string;
  thumbnail_url?: string;
  type?: 'music' | 'meditation' | 'healing';
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  handle?: string;
  created_at?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  image: string;
  creator: string;
  plays: number;
  likes: number;
  trackCount: number;
}