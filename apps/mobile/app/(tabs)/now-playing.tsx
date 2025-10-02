// apps/mobile/app/(tabs)/now-playing.tsx
import { View } from 'react-native';
import { H1, Card, P } from '@/ui';

export default function NowPlaying() {
  return (
    <View className="flex-1 p-4 bg-white dark:bg-black">
      <H1>Now Playing</H1>

      <Card className="mt-4 gap-4">
        <P>PlayerControls UI goes here</P>

        {/*
        When you're ready, uncomment and provide handlers/state:

        <PlayerControls
          isPlaying={false}
          progress={0.12}
          onSeek={(p) => {}}
          onPlayPause={() => {}}
          onPrev={() => {}}
          onNext={() => {}}
        />
        */}
      </Card>
    </View>
  );
}
