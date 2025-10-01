import React, { useState } from 'react';
import { ArrowLeft, Bell, Music, Heart, MessageCircle, UserPlus, Settings, Star, Trash2 } from 'lucide-react';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import BottomNav from './BottomNav';

interface NotificationsScreenProps {
  onBack: () => void;
  onCreateMusic?: () => void;
  onMySongs?: () => void;
  onAccountSettings?: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onCreateMusic,
  onMySongs,
  onAccountSettings
}) => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Handle different notification types with navigation
    switch (notification.type) {
      case 'like':
      case 'track_featured':
        // Navigate to track or player
        if (notification.data?.track_id) {
          console.log('Navigate to track:', notification.data.track_id);
          // onNavigateToTrack?.(notification.data.track_id);
        }
        break;
      case 'follow':
        // Navigate to user profile
        if (notification.data?.follower_id) {
          console.log('Navigate to user profile:', notification.data.follower_id);
          // onNavigateToProfile?.(notification.data.follower_id);
        }
        break;
      case 'dm':
        // Navigate to direct messages
        if (notification.data?.sender_id) {
          console.log('Navigate to DM with:', notification.data.sender_id);
          // onNavigateToDM?.(notification.data.sender_id);
        }
        break;
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent triggering onClick
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'dm':
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'track_featured':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'system':
        return <Bell className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'from-red-500 to-pink-500';
      case 'comment':
      case 'dm':
        return 'from-blue-500 to-purple-500';
      case 'follow':
        return 'from-green-500 to-teal-500';
      case 'track_featured':
        return 'from-yellow-500 to-orange-500';
      case 'system':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-black">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">{unreadCount} unread</p>
            )}
          </div>
        </div>

        <button
          onClick={() => {/* Navigate to notification settings */}}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-4 border-b border-gray-100">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${
            filter === 'unread'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 text-sm">
              {filter === 'unread'
                ? 'All caught up! Check back later for new updates.'
                : 'When you receive notifications, they\'ll appear here.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar or Icon */}
                  <div className="relative flex-shrink-0">
                    {notification.sender?.avatar_url ? (
                      <img
                        src={notification.sender.avatar_url}
                        alt={notification.sender.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-12 h-12 bg-gradient-to-br ${getNotificationBgColor(notification.type)} rounded-full flex items-center justify-center`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}

                    {/* Type Icon Overlay */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.is_read ? 'text-black' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* Unread Indicator */}
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        active="inbox"
        onHome={onBack}
        onLibrary={onMySongs || (() => {})}
        onCreate={onCreateMusic || (() => {})}
        onInbox={() => {}}
        onAccount={onAccountSettings || (() => {})}
        badgeCount={unreadCount}
        accountInitial="N"
      />
    </div>
  );
};

export default NotificationsScreen;