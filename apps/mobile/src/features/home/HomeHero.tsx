import { memo } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';

import { Card, H1, P } from '@/ui';

type HomeHeroProps = {
  name?: string;
};

const backgroundUri =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80';

function HomeHeroComponent({ name }: HomeHeroProps) {
  return (
    <Card style={styles.container}>
      <ImageBackground
        source={{ uri: backgroundUri }}
        resizeMode="cover"
        style={styles.heroImage}
        imageStyle={styles.heroImageInner}
      >
        <View style={styles.heroOverlay}>
          <P style={styles.heroSubtitle}>Welcome back{name ? `, ${name}` : ''}</P>
          <H1 style={styles.heroTitle}>Where should we take you today?</H1>
          <P style={styles.heroCopy}>
            Drift into a calmer state with playlists crafted by Indara’s healers and community experts.
          </P>
        </View>
      </ImageBackground>
    </Card>
  );
}

export const HomeHero = memo(HomeHeroComponent);

const styles = StyleSheet.create({
  container: {
    padding: 0,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    marginHorizontal: 20,
  },
  heroImage: {
    width: '100%',
    minHeight: 180,
  },
  heroImageInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  heroOverlay: {
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  heroTitle: {
    color: '#ffffff',
    marginTop: 8,
    fontSize: 26,
    fontWeight: '700',
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 12,
    lineHeight: 20,
  },
});
