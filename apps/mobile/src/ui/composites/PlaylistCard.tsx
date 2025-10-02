import { Pressable, View, Image } from 'react-native';
import { H3, Caption } from '../atoms/Text';

type PlaylistCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  coverUri?: string;
  onPress?: (id: string) => void;
  className?: string;
};

export function PlaylistCard({
  id, title, subtitle, coverUri, onPress, className = '',
}: PlaylistCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(id)}
      accessibilityRole="button"
      hitSlop={8}
      className={`bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow ${className}`}
    >
      {coverUri ? (
        <Image
          source={{ uri: coverUri }}
          className="w-full aspect-square rounded-xl bg-slate-200 dark:bg-neutral-800"
        />
      ) : null}

      <View className="mt-2">
        <H3>{title}</H3>
        {subtitle ? <Caption className="mt-0.5">{subtitle}</Caption> : null}
      </View>
    </Pressable>
  );
}
