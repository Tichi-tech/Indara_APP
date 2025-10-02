import { Pressable, Text, PressableProps } from 'react-native';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ title, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-3 rounded-xl items-center justify-center';

  const variantStyles = {
    primary: 'bg-brand',
    secondary: 'bg-surface border border-brand',
    ghost: 'bg-transparent',
  };

  const textStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-brand font-semibold',
    ghost: 'text-brand font-semibold',
  };

  return (
    <Pressable className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      <Text className={textStyles[variant]}>{title}</Text>
    </Pressable>
  );
}
