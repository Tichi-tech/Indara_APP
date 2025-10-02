import { Pressable, View } from 'react-native';
import { H3, Caption } from '../atoms/Text';

type PlaylistCardProps = {
  id: string;
  title: string;
  subtitle: string;
  onPress: (id: string) => void;
};

export function PlaylistCard({ id, title, subtitle, onPress }: PlaylistCardProps) {
  return (
    <Pressable
      onPress={() => onPress(id)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
    >
      <H3>{title}</H3>
      <Caption className="mt-1">{subtitle}</Caption>
    </Pressable>
  );
}
