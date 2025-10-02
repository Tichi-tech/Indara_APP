import { View, ViewProps } from 'react-native';

export function Card(p: ViewProps) {
  return <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow" {...p} />;
}
