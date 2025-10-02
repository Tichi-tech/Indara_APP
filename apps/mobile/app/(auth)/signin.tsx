import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';

export default function SignIn() {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message || 'Failed to sign in');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Welcome back to Indara</Text>

        <View style={styles.buttonContainer}>
          <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
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
  note: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
