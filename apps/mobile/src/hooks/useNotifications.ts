import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type NotificationType = 'like' | 'comment' | 'dm' | 'system' | 'follow' | 'track_featured';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  sender_id?: string | null;
  sender?: {
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`*, sender:profiles!notifications_sender_id_fkey(display_name, avatar_url)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const payload: Notification[] = (data ?? []).map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        data: item.data ?? undefined,
        is_read: Boolean(item.is_read),
        created_at: item.created_at,
        sender_id: item.sender_id ?? undefined,
        sender: item.sender ?? undefined,
      }));

      setNotifications(payload);
      setUnreadCount(payload.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('user_id', user.id);

        if (error) throw error;

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notificationId ? { ...item, is_read: true } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read', error);
      }
    },
    [user?.id]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  }, [user?.id]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;
    
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .eq('user_id', user.id);

        if (error) throw error;

        setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      } catch (error) {
        console.error('Failed to delete notification', error);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('notifications')
            .select(`*, sender:profiles!notifications_sender_id_fkey(display_name, avatar_url)`)
            .eq('id', payload.new.id)
            .maybeSingle();

          if (!data) return;

          const next: Notification = {
            id: data.id,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data ?? undefined,
            is_read: Boolean(data.is_read),
            created_at: data.created_at,
            sender_id: data.sender_id ?? undefined,
            sender: data.sender ?? undefined,
          };

          setNotifications((prev) => [next, ...prev]);
          if (!next.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    void fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
