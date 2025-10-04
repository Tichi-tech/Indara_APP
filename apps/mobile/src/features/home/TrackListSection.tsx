import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, H2, Caption, TrackRow } from '@/ui';

type TrackListItem = {
  id: string;
  title: string;
  artist?: string;
  durationSec?: number;
  stats?: { plays: number; likes: number };
};

type TrackListSectionProps = {
  tracks: TrackListItem[];
  onTrackPress?: (trackId: string) => void;
};

function TrackListSectionComponent({ tracks, onTrackPress }: TrackListSectionProps) {
  if (!tracks.length) return null;

  return (
    <View style={styles.section}>
      <H2 style={styles.title}>Trending Tracks</H2>
      <Caption style={styles.subtitle}>What the community is listening to right now.</Caption>
      <Card style={styles.card}>
        {tracks.map((track, idx) => (
          <View key={track.id}>
            <TrackRow
              id={track.id}
              title={track.title}
              artist={track.artist}
              durationSec={track.durationSec}
              stats={track.stats}
              onPress={() => onTrackPress?.(track.id)}
            />
            {idx < tracks.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </Card>
    </View>
  );
}

export const TrackListSection = memo(TrackListSectionComponent);

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 12,
    color: '#6b7280',
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },
});
