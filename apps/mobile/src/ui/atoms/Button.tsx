import { Pressable, Text, PressableProps } from 'react-native';

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
};

export function Button({ title, variant = 'primary', className = '', ...p }: Props) {
  const base = 'px-4 py-3 rounded-2xl items-center justify-center';
  const styles =
    variant === 'primary'
      ? 'bg-black dark:bg-white'
      : variant === 'secondary'
      ? 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700'
      : 'bg-transparent';

  const textStyles =
    variant === 'primary'
      ? 'text-white dark:text-black'
      : variant === 'secondary'
      ? 'text-black dark:text-white'
      : 'text-black dark:text-white';

  return (
    <Pressable {...p} className={`${base} ${styles} ${className}`}>
      <Text className={`text-base font-semibold text-center ${textStyles}`}>{title}</Text>
    </Pressable>
  );
}
