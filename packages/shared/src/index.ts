// Indara AI Shared Package
// UI-agnostic code shared between web and mobile apps

// Types
export * from './types/index.js';

// Supabase client and API
export { supabase, auth, musicApi, db, isAdminUser } from './supabase.js';

// Utilities
export { getSmartThumbnail } from './utils/thumbnailMatcher.js';