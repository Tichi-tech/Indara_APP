import { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Card, Caption, H2, P } from '@/ui';
import type { PlaylistItem } from '@/types/home';

type PlaylistRailProps = {
  title: string;
  description?: string;
  playlists: PlaylistItem[];
  onPlaylistPress?: (playlistId: string) => void;
};

function PlaylistRailComponent({ title, description, playlists, onPlaylistPress }: PlaylistRailProps) {
  if (!playlists.length) return null;

  return (
    <View style={styles.section}>
      <H2 style={styles.sectionTitle}>{title}</H2>
      {description ? <Caption style={styles.sectionSubtitle}>{description}</Caption> : null}

      <View style={styles.list}>
        {playlists.map((playlist) => (
          <Card key={playlist.id} style={styles.playlistCard}>
            <Pressable onPress={() => onPlaylistPress?.(playlist.id)} style={styles.playlistRow}>
              <Image
                source={{ uri: playlist.image ?? 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=60' }}
                style={styles.playlistImage}
              />
              <View style={styles.playlistTextWrap}>
                <P style={styles.playlistTitle} numberOfLines={1}>
                  {playlist.title}
                </P>
                <Caption style={styles.playlistDescription} numberOfLines={2}>
                  {playlist.description}
                </Caption>
                <Caption style={styles.playlistMeta}>
                  {playlist.trackCount ?? 0} tracks • {playlist.duration ?? '–'}
                </Caption>
              </View>
            </Pressable>
          </Card>
        ))}
      </View>
    </View>
  );
}

export const PlaylistRail = memo(PlaylistRailComponent);

const styles = StyleSheet.create({
  section: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    marginTop: 4,
    color: '#6b7280',
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
  playlistTextWrap: {
    flex: 1,
    marginLeft: 16,
  },
  playlistImage: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  playlistDescription: {
    marginTop: 6,
    color: '#6b7280',
  },
  playlistMeta: {
    marginTop: 8,
    color: '#9ca3af',
  },
});
