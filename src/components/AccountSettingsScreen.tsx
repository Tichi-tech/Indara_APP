import React, { useEffect } from 'react';
import { ArrowLeft, ChevronRight, User, Bell, Shield, HelpCircle, LogOut, Crown, BarChart3 } from 'lucide-react';
import { useMyProfile } from '../hooks/useMyProfile';
import { useAuth } from '../hooks/useAuth';
import { isAdminUser } from '../lib/supabase';

interface AccountSettingsScreenProps {
  onBack: () => void;
  userName: string;
  userHandle: string;
  onLogout: () => void;
  onViewProfile: () => void;
  onEditProfile: () => void;
  onNotifications: () => void;
  onAnalytics?: () => void;
  refreshProfile?: () => void;
}

const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({
  onBack,
  userName,
  userHandle,
  onLogout,
  onViewProfile,
  onEditProfile,
  onNotifications,
  onAnalytics,
  refreshProfile
}) => {
  const { user } = useAuth();
  const {
    getDisplayName,
    getUserInitials,
    getUsername
  } = useMyProfile();

  const isAdmin = isAdminUser(user);

  // Refresh profile data when returning from edit screen
  useEffect(() => {
    if (refreshProfile) {
      refreshProfile();
    }
  }, [refreshProfile]);
  const baseSettingsItems = [
    {
      icon: User,
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onClick: onEditProfile
    },
    {
      icon: Crown,
      title: 'Subscription',
      subtitle: 'Upgrade to Premium',
      onClick: () => console.log('Subscription management'),
      isSubscription: true
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onClick: onNotifications
    },
  ];

  // Add Analytics option only for admin users
  const analyticsItem = isAdmin ? {
    icon: BarChart3,
    title: 'Analytics',
    subtitle: 'View music performance and platform stats',
    onClick: onAnalytics || (() => console.log('Analytics coming soon'))
  } : null;

  const settingsItems = [
    ...baseSettingsItems,
    ...(analyticsItem ? [analyticsItem] : []),
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Control your privacy settings',
      onClick: () => console.log('Privacy settings')
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onClick: () => console.log('Help & Support')
    }
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-black">Account</h1>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="p-4 border-b border-gray-100">
          <button 
            onClick={onViewProfile}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-lg font-semibold text-black">{getDisplayName()}</h2>
              <p className="text-gray-600">@{getUsername() || userHandle}</p>
              <p className="text-sm text-purple-600 mt-1">View Profile</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Settings Items */}
        <div className="p-4 space-y-2">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-black">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.subtitle}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* App Info */}
        <div className="p-4 border-t border-gray-100 mt-8">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-black">Indara</h3>
            <p className="text-sm text-gray-600">Version 1.0.0</p>
            <p className="text-xs text-gray-500">AI-powered healing music</p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-600">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsScreen;