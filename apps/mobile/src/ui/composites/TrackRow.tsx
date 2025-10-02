import { Pressable, View } from 'react-native';
import { P, Caption } from '../atoms/Text';

type TrackRowProps = {
  id: string;
  title: string;
  artist?: string;
  durationSec?: number;
  onPress?: (id: string) => void;
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TrackRow({ id, title, artist, durationSec, onPress }: TrackRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(id)}
      className="flex-row items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700"
    >
      <View className="flex-1">
        <P>{title}</P>
        {artist && <Caption className="mt-1">{artist}</Caption>}
      </View>
      {durationSec && <Caption>{formatDuration(durationSec)}</Caption>}
    </Pressable>
  );
}
