import { Text, TextProps, StyleSheet } from 'react-native';

export const H1 = ({ style, ...props }: TextProps) => (
  <Text {...props} style={[styles.h1, style]} />
);

export const H2 = ({ style, ...props }: TextProps) => (
  <Text {...props} style={[styles.h2, style]} />
);

export const H3 = ({ style, ...props }: TextProps) => (
  <Text {...props} style={[styles.h3, style]} />
);

export const P = ({ style, ...props }: TextProps) => (
  <Text {...props} style={[styles.p, style]} />
);

export const Caption = ({ style, ...props }: TextProps) => (
  <Text {...props} style={[styles.caption, style]} />
);

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  p: {
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
  },
  caption: {
    fontSize: 12,
    color: '#6b7280',
  },
});
