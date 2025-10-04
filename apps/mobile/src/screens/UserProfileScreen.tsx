import { memo, useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useMyProfile } from '@/hooks/useMyProfile';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { useNotifications } from '@/hooks/useNotifications';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';

type UserProfileScreenProps = {
  onBack?: () => void;
  onEdit?: () => void;
};

function UserProfileScreenComponent({ onBack, onEdit }: UserProfileScreenProps) {
  const { profile, getDisplayName, getUsername, getBio, getJoinedDate, getUserInitials } = useMyProfile();
  const { stats, popularTracks, loading: analyticsLoading, averageLikesPerTrack, averagePlaysPerTrack, engagementRate } = useUserAnalytics();
  const { unreadCount } = useNotifications();

  const topTracks = useMemo(() => popularTracks.slice(0, 3), [popularTracks]);
  const avatarInitial = getUserInitials();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
            <Feather name="arrow-left" size={20} color="#111827" />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onEdit} style={styles.headerButton}>
            <Feather name="edit-3" size={18} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{avatarInitial}</Text>
          </View>
          <Text style={styles.name}>{getDisplayName()}</Text>
          <Text style={styles.handle}>@{getUsername()}</Text>
          <Text style={styles.joined}>Joined {getJoinedDate() || 'recently'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analyticsLoading ? '—' : stats.totalTracks}</Text>
            <Text style={styles.statLabel}>Tracks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analyticsLoading ? '—' : stats.totalPlays}</Text>
            <Text style={styles.statLabel}>Plays</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analyticsLoading ? '—' : stats.totalLikes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Inbox</Text>
          </View>
        </View>

        <View style={styles.analyticsCard}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}>
              <Feather name="bar-chart-2" size={16} color="#6366f1" />
              <Text style={styles.analyticsLabel}>Avg Plays</Text>
              <Text style={styles.analyticsValue}>{averagePlaysPerTrack}</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Feather name="heart" size={16} color="#f43f5e" />
              <Text style={styles.analyticsLabel}>Avg Likes</Text>
              <Text style={styles.analyticsValue}>{averageLikesPerTrack}</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Feather name="activity" size={16} color="#22c55e" />
              <Text style={styles.analyticsLabel}>Engagement</Text>
              <Text style={styles.analyticsValue}>{engagementRate}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>
            {getBio() || 'Creating healing experiences through sound. Every track is crafted to help you rest, reset, and reconnect.'}
          </Text>
        </View>

        {topTracks.length ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Popular tracks</Text>
            {topTracks.map((track) => (
              <View key={track.id} style={styles.trackRow}>
                <Image
                  source={{
                  uri:
                    track.thumbnailUrl ||
                    getSmartThumbnail(track.title || 'Untitled', '', ''),
                  }}
                  style={styles.trackCover}
                />
                <View style={styles.trackBody}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.trackMeta}>Plays: {track.plays ?? 0} · Likes: {track.likes ?? 0}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  handle: {
    color: '#6b7280',
  },
  joined: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  analyticsCard: {
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    padding: 16,
    gap: 16,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    alignItems: 'center',
    gap: 6,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  analyticsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sectionBlock: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 16,
  },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  trackBody: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  trackMeta: {
    fontSize: 12,
    color: '#64748b',
  },
});

export const UserProfileScreen = memo(UserProfileScreenComponent);

export default UserProfileScreen;
