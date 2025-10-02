import { View } from 'react-native';
import { H1, Card, P } from '@/ui';

export default function NowPlaying() {
  return (
    <View className="flex-1 p-4 bg-white dark:bg-black">
      <H1>Now Playing</H1>
      <Card className="mt-4">
        <P>PlayerControls UI goes here</P>
      </Card>
    </View>
  );
}
