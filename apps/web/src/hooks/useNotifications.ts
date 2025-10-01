import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'dm' | 'system' | 'follow' | 'track_featured';
  title: string;
  message: string;
  data?: any; // Additional data (track_id, user_id, etc.)
  is_read: boolean;
  created_at: string;
  sender_id?: string;
  sender?: {
    display_name: string;
    avatar_url?: string;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!sender_id(display_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedNotifications = (data || []).map(notif => ({
        ...notif,
        sender: notif.sender || undefined
      })) as Notification[];

      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user?.id) return;


    // Subscribe to new notifications
    const notificationChannel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔔 New notification received:', payload.new);

          // Fetch the complete notification with sender data
          const { data: fullNotification } = await supabase
            .from('notifications')
            .select(`
              *,
              sender:profiles!sender_id(display_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (fullNotification) {
            const typedNotification = {
              ...fullNotification,
              sender: fullNotification.sender || undefined
            } as Notification;

            setNotifications(prev => [typedNotification, ...prev]);
            if (!typedNotification.is_read) {
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Notification updated:', payload.new);

          const typedNotification = {
            ...payload.new,
            sender: undefined // Will need to fetch if needed
          } as Notification;

          setNotifications(prev =>
            prev.map(notif =>
              notif.id === typedNotification.id
                ? { ...notif, ...typedNotification }
                : notif
            )
          );
        }
      )
      .subscribe();

    // Initial fetch
    fetchNotifications();

    // Cleanup
    return () => {
      console.log('🔕 Cleaning up notification subscriptions');
      supabase.removeChannel(notificationChannel);
    };
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
};