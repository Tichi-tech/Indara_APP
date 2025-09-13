import React from 'react';
import { ArrowLeft, Music, Heart, Users, Calendar } from 'lucide-react';

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
  const stats = [
    { label: 'Tracks', value: '12', icon: Music },
    { label: 'Likes', value: '248', icon: Heart },
    { label: 'Followers', value: '89', icon: Users },
    { label: 'Joined', value: 'Jan 2024', icon: Calendar }
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
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-black">{userName}</h2>
          <p className="text-gray-600">@{userHandle}</p>
        </div>

        {/* Stats */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
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

        {/* Bio Section */}
        <div className="px-6 mb-6">
          <h3 className="font-medium text-black mb-2">About</h3>
          <p className="text-gray-600 leading-relaxed">
            Creating healing music to help others find peace and tranquility. 
            Each track is crafted with intention and love. 🎵✨
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