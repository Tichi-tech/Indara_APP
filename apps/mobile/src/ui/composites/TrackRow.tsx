import { Pressable, View } from 'react-native';
import { P, Caption } from '../atoms/Text';

type TrackRowProps = {
  id: string;
  title: string;
  artist?: string;
  durationSec?: number;
  onPress?: (id: string) => void;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function TrackRow({ id, title, artist, durationSec, onPress }: TrackRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(id)}
      className="flex-row items-center justify-between py-3"
      accessibilityRole="button"
      hitSlop={8}
    >
      <View className="flex-1">
        <P>{title}</P>
        {artist ? <Caption className="mt-1">{artist}</Caption> : null}
      </View>
      {typeof durationSec === 'number' ? <Caption>{formatDuration(durationSec)}</Caption> : null}
    </Pressable>
  );
}
