import { View, ViewProps } from 'react-native';

type TWViewProps = ViewProps & { className?: string };

export function Card({ className = '', ...p }: TWViewProps) {
  return <View {...p} className={`bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow ${className}`} />;
}
