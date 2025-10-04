import { Pressable, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { P, Caption } from '../atoms/Text';

type TrackRowProps = {
  id: string;
  title: string;
  artist?: string;
  durationSec?: number;
  stats?: { plays?: number; likes?: number };
  onPress?: (id: string) => void;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function TrackRow({ id, title, artist, durationSec, stats, onPress }: TrackRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={styles.row}
      accessibilityRole="button"
      hitSlop={8}
    >
      <View style={styles.rowText}>
        <P style={styles.rowTitle} numberOfLines={1}>
          {title}
        </P>
        {artist ? <Caption style={styles.rowArtist} numberOfLines={1}>{artist}</Caption> : null}
        {stats ? (
          <View style={styles.rowStats}>
            <View style={styles.statItem}>
              <Feather name="headphones" size={12} color="#6b7280" />
              <Caption style={styles.statLabel}>{stats.plays ?? 0}</Caption>
            </View>
            <View style={styles.statItem}>
              <Feather name="heart" size={12} color="#6b7280" />
              <Caption style={styles.statLabel}>{stats.likes ?? 0}</Caption>
            </View>
          </View>
        ) : null}
      </View>
      {typeof durationSec === 'number' ? (
        <Caption style={styles.rowDuration}>{formatDuration(durationSec)}</Caption>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  rowArtist: {
    marginTop: 4,
    color: '#6b7280',
  },
  rowStats: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statLabel: {
    color: '#6b7280',
  },
  rowDuration: {
    color: '#6b7280',
  },
});
