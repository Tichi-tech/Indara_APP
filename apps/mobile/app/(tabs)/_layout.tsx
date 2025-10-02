import { Tabs, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="now-playing" options={{ title: 'Now Playing' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
