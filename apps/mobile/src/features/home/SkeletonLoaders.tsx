import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/ui/atoms/Skeleton';
import { Card } from '@/ui';

export function HealingCommunitySkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Skeleton width={180} height={24} />
      </View>

      <View style={styles.carousel}>
        {[1, 2, 3].map((i) => (
          <Card key={i} style={styles.trackCard}>
            <Skeleton width={192} height={144} borderRadius={24} />
            <View style={styles.trackInfo}>
              <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
              <Skeleton width="60%" height={12} />
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

export function PlaylistRailSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Skeleton width={160} height={24} />
        <Skeleton width="70%" height={14} style={{ marginTop: 8 }} />
      </View>

      <View style={styles.list}>
        {[1, 2, 3].map((i) => (
          <Card key={i} style={styles.playlistCard}>
            <View style={styles.playlistRow}>
              <Skeleton width={64} height={64} borderRadius={20} />
              <View style={styles.playlistText}>
                <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="50%" height={12} />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 16,
  },
  carousel: {
    flexDirection: 'row',
    gap: 16,
  },
  trackCard: {
    width: 192,
    padding: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  trackInfo: {
    padding: 14,
  },
  list: {
    marginTop: 20,
  },
  playlistCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistText: {
    flex: 1,
    marginLeft: 16,
  },
});
