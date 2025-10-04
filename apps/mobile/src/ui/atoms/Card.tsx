import { StyleSheet, View, ViewProps } from 'react-native';

type Props = ViewProps & {
  style?: ViewProps['style'];
};

export function Card({ style, ...props }: Props) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
