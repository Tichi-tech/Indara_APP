import React, { useState } from 'react';
import { ArrowLeft, Music, Play, Heart, TrendingUp, Calendar, Users, Download, RefreshCw, Shield } from 'lucide-react';
import { useUserAnalytics } from '../hooks/useUserAnalytics';
import { useAuth } from '../hooks/useAuth';
import { isAdminUser } from '../lib/supabase';
import BottomNav from './BottomNav';
import { getSmartThumbnail } from '../utils/thumbnailMatcher';

interface AnalyticsDashboardProps {
  onBack: () => void;
  onCreateMusic?: () => void;
  onMySongs?: () => void;
  onAccountSettings?: () => void;
  onInbox?: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onBack,
  onCreateMusic,
  onMySongs,
  onAccountSettings,
  onInbox
}) => {
  const { user } = useAuth();
  const {
    stats,
    popularTracks,
    loading,
    error,
    averagePlaysPerTrack,
    averageLikesPerTrack,
    engagementRate,
    refresh
  } = useUserAnalytics();

  const isAdmin = isAdminUser(user);

  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'engagement'>('overview');

  const handleRefresh = async () => {
    await refresh();
  };

  const handleExportData = () => {
    const analyticsData = {
      exportDate: new Date().toISOString(),
      stats,
      popularTracks,
      calculatedMetrics: {
        averagePlaysPerTrack,
        averageLikesPerTrack,
        engagementRate
      }
    };

    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `indara-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Admin access check
  if (!isAdmin) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Analytics dashboard is only available for administrators.</p>
          <button
            onClick={onBack}
            className="bg-black text-white px-6 py-2 rounded-full font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-[420px] h-dvh flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
            <h1 className="text-xl font-bold text-black">Analytics</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportData}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'tracks', label: 'Tracks' },
              { id: 'engagement', label: 'Engagement' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-[180px] [padding-bottom:calc(env(safe-area-inset-bottom)+180px)]">
          {error && (
            <div className="px-6 py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-red-600 text-sm font-medium hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div>
                <h2 className="text-lg font-semibold text-black mb-4">Key Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-black">{stats.total_tracks}</p>
                    <p className="text-sm text-gray-600">Total Tracks</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-black">{stats.total_plays}</p>
                    <p className="text-sm text-gray-600">Total Plays</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mb-3">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-black">{stats.total_likes}</p>
                    <p className="text-sm text-gray-600">Total Likes</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-black">{stats.credits_used}</p>
                    <p className="text-sm text-gray-600">Credits Used</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h2 className="text-lg font-semibold text-black mb-4">Performance</h2>
                <div className="space-y-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Average Plays per Track</p>
                        <p className="text-xl font-semibold text-black">{averagePlaysPerTrack}</p>
                      </div>
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Average Likes per Track</p>
                        <p className="text-xl font-semibold text-black">{averageLikesPerTrack}</p>
                      </div>
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Engagement Rate</p>
                        <p className="text-xl font-semibold text-black">{engagementRate}%</p>
                      </div>
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tracks Tab */}
          {activeTab === 'tracks' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Track Performance</h2>
              {popularTracks.length > 0 ? (
                <div className="space-y-4">
                  {popularTracks.map((track, index) => (
                    <div key={track.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">#{index + 1}</span>
                        </div>
                        <img
                          src={track.thumbnail_url || getSmartThumbnail(
                            track.title || 'Untitled',
                            track.prompt || track.admin_notes || '',
                            track.style || '',
                            track.id
                          )}
                          alt={track.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-black">{track.title}</h3>
                          <p className="text-xs text-gray-500">{formatDate(track.created_at)}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Play className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">0</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tracks to analyze yet</p>
                  <p className="text-sm text-gray-400">Create some tracks to see detailed analytics</p>
                </div>
              )}
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === 'engagement' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-black mb-4">Engagement Insights</h2>
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-black mb-2">Listen-to-Like Ratio</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(engagementRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-4 text-sm font-medium text-black">{engagementRate}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {engagementRate > 15 ? 'Excellent engagement!' :
                       engagementRate > 10 ? 'Good engagement' :
                       'Room for improvement'}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-black mb-2">Content Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{averagePlaysPerTrack}</p>
                        <p className="text-xs text-gray-500">Avg plays/track</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-500">{averageLikesPerTrack}</p>
                        <p className="text-xs text-gray-500">Avg likes/track</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-black mb-3">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Most played track</span>
                        <span className="text-sm font-medium text-black">
                          {popularTracks[0]?.title || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total content created</span>
                        <span className="text-sm font-medium text-black">{stats.total_tracks} tracks</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Community impact</span>
                        <span className="text-sm font-medium text-black">{stats.total_plays} plays</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          active="account"
          onHome={onBack}
          onLibrary={onMySongs || (() => {})}
          onCreate={onCreateMusic || (() => {})}
          onInbox={onInbox || (() => {})}
          onAccount={onAccountSettings || (() => {})}
          badgeCount={1}
          accountInitial="A"
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;