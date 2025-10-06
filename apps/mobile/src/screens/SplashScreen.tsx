import { memo } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type SplashScreenProps = {
  onComplete?: () => void;
};

function SplashScreenComponent({ onComplete }: SplashScreenProps) {
  return (
    <LinearGradient
      colors={['#29034A', '#520346', '#D300BE']}
      locations={[0.12, 0.88, 1]}
      style={styles.container}
    >
      <Pressable
        style={styles.content}
        onPress={onComplete}
        accessibilityRole="button"
        accessibilityLabel="Tap to continue"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.appName}>Indara</Text>
        </View>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    position: 'absolute',
    top: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 300,
  },
  textContainer: {
    position: 'absolute',
    top: 420,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#EEDDEE',
    letterSpacing: 2,
    fontFamily: 'SF Pro',
  },
});

export const SplashScreen = memo(SplashScreenComponent);

export default SplashScreen;
