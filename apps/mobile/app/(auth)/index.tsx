import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎵 Welcome to Indara</Text>
        <Text style={styles.subtitle}>Healing Music & Meditation</Text>

        <View style={styles.buttonContainer}>
          <Link href="/(auth)/signin" asChild>
            <Button title="Sign In" />
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    maxWidth: 300,
  },
});
