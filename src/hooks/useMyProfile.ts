import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

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
  const refetching = useRef(false);

  const refetch = useCallback(async () => {
    if (refetching.current) return;
    refetching.current = true;
    try {
      console.log("👤 useMyProfile: Fetching user profile...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url, bio, phone, created_at, updated_at")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        console.log("✅ Profile loaded:", data);
        setProfile(data as Profile);
      }
    } finally {
      // tiny delay prevents back-to-back cascades
      setTimeout(() => { refetching.current = false; }, 200);
    }
  }, []);

  // Initial load once
  useEffect(() => { void refetch(); }, [refetch]);

  // Subscribe ONCE per userId (guards StrictMode double effects)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      if (currentUserIdRef.current === user.id && channelRef.current) {
        // already subscribed for this user
        return;
      }

      // tear down previous channel
      if (channelRef.current) {
        console.log("🔴 Cleaning up profile subscription...");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      currentUserIdRef.current = user.id;

      console.log("🟢 Setting up real-time subscription for profile...");
      const ch = supabase
        .channel(`profile:${user.id}`)
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          // merge payload; do NOT call refetch() here to avoid loops
          setProfile((p) => ({ ...(p ?? {} as any), ...(payload.new as Profile) }));
        })
        .subscribe();

      channelRef.current = ch;
    })();

    return () => {
      cancelled = true;
      // Keep the channel around across StrictMode mounts; we remove it when switching users
      // If you prefer hard cleanup on unmount, uncomment:
      // if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    };
  }, []);

  // Auth events: refetch only on meaningful ones
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Avoid refetch spam from TOKEN_REFRESHED
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
        void refetch();
      }
    });
    return () => subscription.unsubscribe();
  }, [refetch]);

  // Helper functions
  const getDisplayName = () => {
    return profile?.display_name || 'User';
  };

  const getUsername = () => {
    return profile?.username || '';
  };

  const getPhone = () => {
    return profile?.phone || '';
  };

  const getUserInitials = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const getBio = () => {
    return profile?.bio || '';
  };

  const getJoinedDate = () => {
    if (!profile?.created_at) return '';
    return new Date(profile.created_at).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  // Update profile function
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

      console.log('💾 Updating profile with:', updates);

      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Profile updated successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
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
    updateProfile
  };
}