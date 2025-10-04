export type QuickAction = {
  id: string;
  label: string;
  description: string;
  emoji: string;
};

export const quickActions: QuickAction[] = [
  {
    id: 'create-meditation',
    label: 'Create Meditation',
    description: 'Craft a guided journey in minutes',
    emoji: '✨',
  },
  {
    id: 'talk-to-dara',
    label: 'Talk to Dara',
    description: 'Tell Dara how you want to feel today',
    emoji: '🧘‍♀️',
  },
  {
    id: 'my-library',
    label: 'My Library',
    description: 'Revisit saved meditations & tracks',
    emoji: '🎧',
  },
];
