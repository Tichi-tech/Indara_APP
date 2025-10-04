import { Pressable, View, Image, StyleSheet } from 'react-native';
import { H3, Caption } from '../atoms/Text';

type PlaylistCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  coverUri?: string;
  onPress?: (id: string) => void;
  style?: any;
};

export function PlaylistCard({ id, title, subtitle, coverUri, onPress, style }: PlaylistCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(id)}
      accessibilityRole="button"
      hitSlop={8}
      style={[styles.card, style]}
    >
      {coverUri ? (
        <Image source={{ uri: coverUri }} style={styles.image} />
      ) : null}

      <View style={styles.copyWrap}>
        <H3 style={styles.title}>{title}</H3>
        {subtitle ? <Caption style={styles.subtitle}>{subtitle}</Caption> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
  },
  copyWrap: {
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
});
