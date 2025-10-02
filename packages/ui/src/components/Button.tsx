import { Pressable, Text } from 'react-native';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'secondary';
  disabled?: boolean;
  className?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  className = '',
}: ButtonProps) {
  const base = 'px-4 py-3 rounded-2xl items-center justify-center';

  const variants = {
    primary: 'bg-brand',
    secondary: 'bg-surface border border-brand',
    ghost: 'bg-transparent',
  } as const;

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-brand',
    ghost: 'text-brand',
  } as const;

  return (
    <Pressable
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text className={`text-base font-semibold ${textVariants[variant]}`}>
        {title}
      </Text>
    </Pressable>
  );
}
