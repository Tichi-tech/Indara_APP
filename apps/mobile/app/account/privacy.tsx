import { StyleSheet, Text, View } from 'react-native';

export default function PrivacySecurity() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy & Security</Text>
      <Text style={styles.subtitle}>Control over privacy settings will be added soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
});
