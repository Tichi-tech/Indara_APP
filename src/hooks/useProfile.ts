import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  username: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  subscription_plan_id: string;
  status: 'active' | 'inactive' | 'cancelled';
  started_at: string;
  ends_at: string | null;
  subscription_plans?: {
    id: string;
    name: string;
    price: number;
    features: string[];
    is_active: boolean;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_active: boolean;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await db.getUserProfile(user.id);

      if (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user subscription
  const fetchSubscription = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await db.getUserSubscription(user.id);

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  // Fetch available subscription plans
  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await db.getSubscriptionPlans();

      if (error) {
        console.error('Error fetching subscription plans:', error);
      } else {
        setSubscriptionPlans(data || []);
      }
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
    }
  };

  // Update user profile
  const updateProfile = async (updates: { display_name?: string; avatar_url?: string; bio?: string; username?: string; phone?: string }) => {
    if (!user?.id) return { success: false, error: 'No user found' };

    try {
      const { error } = await db.updateUserProfile(user.id, updates);

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Failed to update profile' };
      }

      // Refresh profile after update
      await fetchProfile();
      return { success: true };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  // Get user display name (fallback to email or default)
  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Get user avatar (fallback to initials)
  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    return null;
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Get username from profile
  const getUsername = () => {
    return profile?.username || '';
  };

  // Get phone from profile
  const getPhone = () => {
    return profile?.phone || '';
  };

  // Check if user has active subscription
  const hasActiveSubscription = () => {
    return subscription?.status === 'active';
  };

  // Get subscription plan name
  const getSubscriptionPlanName = () => {
    return subscription?.subscription_plans?.name || 'Free';
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchSubscription();
      fetchSubscriptionPlans();
    } else {
      setProfile(null);
      setSubscription(null);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    profile,
    subscription,
    subscriptionPlans,
    loading,
    error,
    updateProfile,
    getDisplayName,
    getAvatarUrl,
    getUserInitials,
    getUsername,
    getPhone,
    hasActiveSubscription,
    getSubscriptionPlanName,
    refreshProfile: fetchProfile,
    refreshSubscription: fetchSubscription,
  };
};