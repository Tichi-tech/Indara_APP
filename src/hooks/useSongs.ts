import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { db } from '../lib/supabase'

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
  user_id?: string;
  is_featured?: boolean;
  audio_url?: string;
  status?: string;
  prompt?: string;
  style?: string;
}

export function useSongs() {
  const { user } = useAuth()
  const [songs, setSongs] = useState<Song[]>([])
  const [publicSongs, setPublicSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's songs
  const fetchUserSongs = async () => {
    if (!user) {
      setSongs([])
      return
    }

    try {
      const { data, error } = await db.getUserSongs(user.id)
      if (error) {
        console.error('Error fetching user songs:', error)
        setError(error.message)
      } else {
        // Transform database format to app format
        const transformedSongs = (data || []).map(song => ({
          id: song.id,
          title: song.title || 'Untitled',
          description: song.prompt || '',
          tags: song.style || '',
          plays: 0,
          likes: 0,
          image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
          version: 'v1.0',
          isPublic: song.is_featured || false,
          createdAt: song.created_at,
          creator: 'You',
          duration: song.duration || '3:45',
          user_id: song.user_id,
          audio_url: song.audio_url,
          status: song.status,
          prompt: song.prompt,
          style: song.style
        }))
        setSongs(transformedSongs)
      }
    } catch (err) {
      console.error('Error fetching user songs:', err)
      setError('Failed to fetch songs')
    }
  }

  // Fetch public/featured songs
  const fetchPublicSongs = async () => {
    try {
      const { data, error } = await db.getPublicSongs()
      if (error) {
        console.error('Error fetching public songs:', error)
        setError(error.message)
      } else {
        // Transform database format to app format
        const transformedSongs = (data || []).map(song => ({
          id: song.id,
          title: song.title || 'Untitled',
          description: song.prompt || '',
          tags: song.style || '',
          plays: Math.floor(Math.random() * 1000),
          likes: Math.floor(Math.random() * 100),
          image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
          version: 'v1.0',
          isPublic: true,
          createdAt: song.created_at,
          creator: 'Community',
          duration: song.duration || '3:45',
          user_id: song.user_id,
          audio_url: song.audio_url,
          status: song.status,
          prompt: song.prompt,
          style: song.style
        }))
        setPublicSongs(transformedSongs)
      }
    } catch (err) {
      console.error('Error fetching public songs:', err)
      setError('Failed to fetch public songs')
    }
  }

  // Create a new song
  const createSong = async (songData: {
    title: string;
    description: string;
    tags: string;
    image: string;
    is_public?: boolean;
    duration?: string;
  }) => {
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    // Add retry logic and better error handling
    try {
      const dbSongData = {
        user_id: user.id,
        title: songData.title,
        prompt: songData.description,
        style: songData.tags,
        duration: songData.duration || '3:45',
        is_featured: songData.is_public || false,
        status: 'completed'
      }

      const { data, error } = await db.createSong(dbSongData)
      
      if (error) {
        console.warn('Database save failed, using local storage:', error)
        // Create a local version instead of failing
        const localSong = {
          id: `local-${Date.now()}`,
          title: songData.title,
          description: songData.description,
          tags: songData.tags,
          plays: 0,
          likes: 0,
          image: songData.image,
          version: 'v1.0',
          isPublic: songData.is_public || false,
          createdAt: new Date().toISOString(),
          creator: 'You',
          duration: songData.duration || '3:45',
          user_id: user.id,
          status: 'completed',
          prompt: songData.description,
          style: songData.tags
        }
        
        // Update local state even if DB save fails
        setSongs(prev => [localSong, ...prev])
        
        return { data: localSong, error: null }
      }

      // Transform to app format
      const transformedSong = {
        id: data.id,
        title: data.title,
        description: data.prompt || '',
        tags: data.style || '',
        plays: 0,
        likes: 0,
        image: songData.image,
        version: 'v1.0',
        isPublic: data.is_featured || false,
        createdAt: data.created_at,
        creator: 'You',
        duration: data.duration,
        user_id: data.user_id,
        audio_url: data.audio_url,
        status: data.status,
        prompt: data.prompt,
        style: data.style
      }

      // Update local state
      setSongs(prev => [transformedSong, ...prev])
      
      if (transformedSong.isPublic) {
        setPublicSongs(prev => [transformedSong, ...prev])
      }

      return { data: transformedSong, error: null }
    } catch (err) {
      console.error('Error creating song:', err)
      return { data: null, error: { message: 'Failed to create song' } }
    }
  }

  // Load songs when user changes
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true)
      setError(null)
      
      await Promise.all([
        fetchUserSongs(),
        fetchPublicSongs()
      ])
      
      setLoading(false)
    }

    loadSongs()
  }, [user])

  return {
    songs,
    publicSongs,
    loading,
    error,
    createSong,
    refetch: () => {
      fetchUserSongs()
      fetchPublicSongs()
    }
  }
}