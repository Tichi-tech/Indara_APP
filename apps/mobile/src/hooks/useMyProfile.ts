import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';

type Profile = {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function useMyProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const refetch = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, bio, phone, created_at, updated_at')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } finally {
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 200);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      if (currentUserIdRef.current === user.id && channelRef.current) {
        return;
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      currentUserIdRef.current = user.id;

      const channel = supabase
        .channel(`profile:${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setProfile((current) => ({ ...(current ?? {} as Profile), ...(payload.new as Profile) }));
        })
        .subscribe();

      channelRef.current = channel;
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        void refetch();
      }
    });

    return () => subscription.unsubscribe();
  }, [refetch]);

  const getDisplayName = () => profile?.display_name || 'User';
  const getUsername = () => profile?.username || '';
  const getPhone = () => profile?.phone || '';
  const getUserInitials = () => getDisplayName().charAt(0).toUpperCase();
  const getBio = () => profile?.bio || '';
  const getJoinedDate = () => {
    if (!profile?.created_at) return '';
    return new Date(profile.created_at).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const updateProfile = async (updates: {
    display_name?: string;
    username?: string;
    phone?: string;
    bio?: string;
    avatar_url?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Failed to update profile', error);
      return { success: false, error };
    }
  };

  return {
    profile,
    refetch,
    getDisplayName,
    getUsername,
    getPhone,
    getUserInitials,
    getBio,
    getJoinedDate,
    updateProfile,
  };
}
