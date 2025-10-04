import { View, Text, StyleSheet } from 'react-native';

export default function Inbox() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Inbox coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 16,
    color: '#6b7280',
  },
});
