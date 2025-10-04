import { Pressable, Text, StyleSheet, StyleProp, ViewStyle, PressableProps } from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, variant = 'primary', style, ...props }: Props) {
  const buttonStyle =
    variant === 'primary'
      ? styles.primary
      : variant === 'secondary'
      ? styles.secondary
      : styles.ghost;

  const textStyle =
    variant === 'primary'
      ? styles.primaryText
      : variant === 'secondary'
      ? styles.secondaryText
      : styles.ghostText;

  const combinedStyle: StyleProp<ViewStyle> = [styles.base, buttonStyle, style];

  return (
    <Pressable {...props} style={combinedStyle}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#111827',
  },
  secondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#111827',
  },
  ghostText: {
    color: '#111827',
  },
});
