import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';

export default function Profile() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>👤 Profile</Text>

        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>

            {user.user_metadata?.full_name && (
              <>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{user.user_metadata.full_name}</Text>
              </>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Sign Out" onPress={signOut} color="#dc2626" />
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
  userInfo: {
    width: '100%',
    maxWidth: 300,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    maxWidth: 300,
  },
});
