import { memo, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BottomNav, BottomNavProps } from '@/components/BottomNav';

export type AnalyticsStats = {
  totalTracks: number;
  totalPlays: number;
  totalLikes: number;
  creditsUsed: number;
};

export type AnalyticsTrack = {
  id: string;
  title: string;
  createdAt: string;
  thumbnailUrl?: string;
  plays: number;
  likes: number;
};

export type AnalyticsDashboardProps = {
  onBack?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  stats: AnalyticsStats;
  popularTracks: AnalyticsTrack[];
  averagePlaysPerTrack: number;
  averageLikesPerTrack: number;
  engagementRate: number;
  loading?: boolean;
  error?: string | null;
  bottomNavProps?: BottomNavProps;
  isAdmin?: boolean;
};

function AnalyticsDashboardComponent({
  onBack,
  onRefresh,
  onExport,
  stats,
  popularTracks,
  averagePlaysPerTrack,
  averageLikesPerTrack,
  engagementRate,
  loading = false,
  error,
  bottomNavProps,
  isAdmin = true,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'engagement'>('overview');

  const formattedTracks = useMemo(() => popularTracks.slice(0, 5), [popularTracks]);

  if (!isAdmin) {
    return (
      <View style={styles.restrictedWrap}>
        <View style={styles.restrictedCard}>
          <View style={styles.restrictedIconWrap}>
            <Feather name="shield" size={28} color="#ef4444" />
          </View>
          <Text style={styles.restrictedTitle}>Access Restricted</Text>
          <Text style={styles.restrictedSubtitle}>
            Analytics dashboard is only available for administrators.
          </Text>
          <Pressable style={styles.restrictedButton} onPress={onBack}>
            <Text style={styles.restrictedButtonLabel}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={styles.headerButton}
          >
            <Feather name="arrow-left" size={20} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" onPress={onRefresh} style={styles.headerActionButton}>
            {loading ? (
              <ActivityIndicator size="small" color="#6b7280" />
            ) : (
              <Feather name="refresh-cw" size={18} color="#6b7280" />
            )}
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onExport} style={styles.headerActionButton}>
            <Feather name="download" size={18} color="#6b7280" />
          </Pressable>
        </View>
      </View>

      <View style={styles.tabBar}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'tracks', label: 'Tracks' },
          { id: 'engagement', label: 'Engagement' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={onRefresh}>
            <Text style={styles.errorRetry}>Try Again</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'overview' && (
          <View style={styles.sectionSpacing}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Key Metrics</Text>
            </View>
            <View style={styles.metricsGrid}>
              <MetricCard
                icon="music"
                label="Total Tracks"
                value={stats.totalTracks}
                gradient={['#dbeafe', '#bfdbfe']}
              />
              <MetricCard
                icon="play"
                label="Total Plays"
                value={stats.totalPlays}
                gradient={['#dcfce7', '#bbf7d0']}
              />
              <MetricCard
                icon="heart"
                label="Total Likes"
                value={stats.totalLikes}
                gradient={['#fee2e2', '#fecdd3']}
              />
              <MetricCard
                icon="star"
                label="Credits Used"
                value={stats.creditsUsed}
                gradient={['#ede9fe', '#ddd6fe']}
              />
            </View>

            <View style={styles.sectionSpacing}>
              <Text style={styles.sectionTitle}>Performance</Text>
              <View style={styles.performanceList}>
                <PerformanceItem
                  icon="bar-chart-2"
                  label="Average Plays per Track"
                  value={averagePlaysPerTrack}
                  accent="#22c55e"
                />
                <PerformanceItem
                  icon="heart"
                  label="Average Likes per Track"
                  value={averageLikesPerTrack}
                  accent="#ef4444"
                />
                <PerformanceItem
                  icon="users"
                  label="Engagement Rate"
                  value={`${engagementRate}%`}
                  accent="#3b82f6"
                />
              </View>
            </View>
          </View>
        )}

        {activeTab === 'tracks' && (
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>Track Performance</Text>
            {formattedTracks.length ? (
              <View style={styles.trackList}>
                {formattedTracks.map((track, idx) => (
                  <View key={track.id} style={styles.trackCard}>
                    <View style={styles.trackRankBubble}>
                      <Text style={styles.trackRank}>#{idx + 1}</Text>
                    </View>
                    <Image
                      source={{ uri: track.thumbnailUrl ?? undefined }}
                      style={styles.trackThumbnail}
                    />
                    <View style={styles.trackInfo}>
                      <Text style={styles.trackTitle}>{track.title}</Text>
                      <Text style={styles.trackDate}>{formatDate(track.createdAt)}</Text>
                      <View style={styles.trackStatsRow}>
                        <View style={styles.trackStatsItem}>
                          <Feather name="play" size={12} color="#9ca3af" />
                          <Text style={styles.trackStatsText}>{track.plays}</Text>
                        </View>
                        <View style={styles.trackStatsItem}>
                          <Feather name="heart" size={12} color="#9ca3af" />
                          <Text style={styles.trackStatsText}>{track.likes}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Feather name="music" size={36} color="#d1d5db" />
                <Text style={styles.emptyTitle}>No tracks to analyze</Text>
                <Text style={styles.emptySubtitle}>Create some tracks to see analytics.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'engagement' && (
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>Engagement Insights</Text>
            <View style={styles.engagementCard}>
              <Text style={styles.engagementLabel}>Listen-to-Like Ratio</Text>
              <View style={styles.engagementBarBackground}>
                <View
                  style={[styles.engagementBarFill, { width: `${Math.min(engagementRate, 100)}%` }]}
                />
              </View>
              <Text style={styles.engagementValue}>{engagementRate}%</Text>
            </View>

            <View style={styles.quickStats}>
              <View style={styles.quickStatsItem}>
                <Text style={styles.quickStatsValue}>{averagePlaysPerTrack}</Text>
                <Text style={styles.quickStatsLabel}>Avg plays/track</Text>
              </View>
              <View style={styles.quickStatsItem}>
                <Text style={styles.quickStatsValue}>{averageLikesPerTrack}</Text>
                <Text style={styles.quickStatsLabel}>Avg likes/track</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {bottomNavProps ? <BottomNav {...bottomNavProps} /> : null}
    </View>
  );
}

export const AnalyticsDashboard = memo(AnalyticsDashboardComponent);

const MetricCard = ({
  icon,
  value,
  label,
  gradient,
}: {
  icon: keyof typeof Feather.glyphMap;
  value: number;
  label: string;
  gradient: [string, string];
}) => (
  <View
    style={{
      backgroundColor: gradient[1],
      borderRadius: 18,
      padding: 16,
    }}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: gradient[0],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
      }}
    >
      <Feather name={icon} size={18} color="#ffffff" />
    </View>
    <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>{value}</Text>
    <Text style={{ color: '#6b7280', marginTop: 4 }}>{label}</Text>
  </View>
);

const PerformanceItem = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number | string;
  accent: string;
}) => (
  <View style={styles.performanceItem}>
    <View style={[styles.performanceIconWrap, { backgroundColor: `${accent}22` }]}
    >
      <Feather name={icon} size={18} color={accent} />
    </View>
    <View style={styles.performanceTextWrap}>
      <Text style={styles.performanceLabel}>{label}</Text>
      <Text style={styles.performanceValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ede9fe',
  },
  tabLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabLabelActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    borderWidth: 1,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 8,
  },
  errorRetry: {
    color: '#ef4444',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 140,
    gap: 24,
  },
  sectionSpacing: {
    gap: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  performanceList: {
    gap: 12,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  performanceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  performanceTextWrap: {
    flex: 1,
  },
  performanceLabel: {
    color: '#6b7280',
  },
  performanceValue: {
    marginTop: 4,
    fontWeight: '600',
    color: '#111827',
  },
  trackList: {
    gap: 12,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  trackRankBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trackRank: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  trackThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  trackDate: {
    marginTop: 2,
    fontSize: 12,
    color: '#9ca3af',
  },
  trackStatsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  trackStatsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  trackStatsText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  engagementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  engagementLabel: {
    color: '#6b7280',
  },
  engagementBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginTop: 12,
  },
  engagementBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },
  engagementValue: {
    marginTop: 8,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },
  quickStats: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  quickStatsItem: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  quickStatsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  quickStatsLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  restrictedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  restrictedCard: {
    alignItems: 'center',
    gap: 16,
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  restrictedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  restrictedSubtitle: {
    textAlign: 'center',
    color: '#6b7280',
  },
  restrictedButton: {
    marginTop: 8,
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  restrictedButtonLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return input;
  }
}

export default AnalyticsDashboard;
