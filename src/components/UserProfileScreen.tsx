import React from 'react';
import { ArrowLeft, Music, Heart, Users, Calendar, Play, TrendingUp } from 'lucide-react';
import { useProfileStats } from '../hooks/useProfileStats';
import { useMyProfile } from '../hooks/useMyProfile';
import { useUserAnalytics } from '../hooks/useUserAnalytics';
import { useAuth } from '../hooks/useAuth';
import { isAdminUser } from '../lib/supabase';

interface UserProfileScreenProps {
  onBack: () => void;
  userName: string;
  userHandle: string;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  onBack,
  userName,
  userHandle
}) => {
  const { user } = useAuth();
  const { stats: profileStats, loading: statsLoading } = useProfileStats();
  const { getDisplayName, getUserInitials, getUsername, getBio, getJoinedDate } = useMyProfile();
  const {
    stats,
    popularTracks,
    loading: analyticsLoading,
    averagePlaysPerTrack,
    averageLikesPerTrack,
    engagementRate
  } = useUserAnalytics();

  const isAdmin = isAdminUser(user);

  // For admin users, show analytics data; for regular users, show basic profile stats
  const displayStats = isAdmin ? [
    {
      label: 'Tracks',
      value: analyticsLoading ? '...' : stats.total_tracks.toString(),
      icon: Music
    },
    {
      label: 'Total Plays',
      value: analyticsLoading ? '...' : stats.total_plays.toString(),
      icon: Play
    },
    {
      label: 'Total Likes',
      value: analyticsLoading ? '...' : stats.total_likes.toString(),
      icon: Heart
    },
    {
      label: 'Joined',
      value: statsLoading ? '...' : (getJoinedDate() || profileStats.joinedDate),
      icon: Calendar
    }
  ] : [
    {
      label: 'Tracks',
      value: statsLoading ? '...' : profileStats.tracksCount.toString(),
      icon: Music
    },
    {
      label: 'Likes',
      value: statsLoading ? '...' : profileStats.likesCount.toString(),
      icon: Heart
    },
    {
      label: 'Followers',
      value: statsLoading ? '...' : profileStats.followersCount.toString(),
      icon: Users
    },
    {
      label: 'Joined',
      value: statsLoading ? '...' : (getJoinedDate() || profileStats.joinedDate),
      icon: Calendar
    }
  ];

  const analyticsStats = [
    {
      label: 'Avg Plays/Track',
      value: analyticsLoading ? '...' : averagePlaysPerTrack.toString(),
      icon: TrendingUp
    },
    {
      label: 'Avg Likes/Track',
      value: analyticsLoading ? '...' : averageLikesPerTrack.toString(),
      icon: Heart
    },
    {
      label: 'Engagement Rate',
      value: analyticsLoading ? '...' : `${engagementRate}%`,
      icon: TrendingUp
    },
    {
      label: 'Credits Used',
      value: analyticsLoading ? '...' : stats.credits_used.toString(),
      icon: Music
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
        <h1 className="text-lg font-semibold text-black">Profile</h1>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="p-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">
              {getUserInitials()}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-black">{getDisplayName()}</h2>
          <p className="text-gray-600">@{getUsername() || userHandle}</p>
        </div>

        {/* Basic Stats */}
        <div className="px-6 mb-6">
          <h3 className="font-medium text-black mb-4">Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            {displayStats.map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-4 h-4 text-gray-600" />
                </div>
                <p className="text-lg font-semibold text-black">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Stats - Admin Only */}
        {isAdmin && (
          <div className="px-6 mb-6">
            <h3 className="font-medium text-black mb-4">Analytics</h3>
            <div className="grid grid-cols-2 gap-4">
              {analyticsStats.map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-lg font-semibold text-black">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Tracks - Admin Only */}
        {isAdmin && popularTracks.length > 0 && (
          <div className="px-6 mb-6">
            <h3 className="font-medium text-black mb-4">Top Performing Tracks</h3>
            <div className="space-y-3">
              {popularTracks.slice(0, 3).map((track, index) => (
                <div key={track.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">{track.title}</p>
                    <p className="text-xs text-gray-500">
                      {track.track_plays[0]?.count || 0} plays • {track.track_likes[0]?.count || 0} likes
                    </p>
                  </div>
                  <img
                    src={track.thumbnail_url || 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio Section */}
        <div className="px-6 mb-6">
          <h3 className="font-medium text-black mb-2">About</h3>
          <p className="text-gray-600 leading-relaxed">
            {getBio() || 'Creating healing music to help others find peace and tranquility. Each track is crafted with intention and love. 🎵✨'}
          </p>
        </div>

        {/* Recent Activity */}
        <div className="px-6">
          <h3 className="font-medium text-black mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-700">Created "Morning Meditation"</p>
              <span className="text-xs text-gray-500 ml-auto">2 days ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-700">Shared "Ocean Waves" publicly</p>
              <span className="text-xs text-gray-500 ml-auto">1 week ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-gray-700">Joined Indara community</p>
              <span className="text-xs text-gray-500 ml-auto">1 month ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileScreen;