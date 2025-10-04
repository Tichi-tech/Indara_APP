import { memo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';

import { Card, Caption, H3 } from '@/ui';

import type { QuickAction } from './content';

type QuickActionsProps = {
  actions: QuickAction[];
  onActionPress?: (action: QuickAction) => void;
};

function QuickActionsComponent({ actions, onActionPress }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <Card key={action.id} style={styles.card}>
          <Pressable
            onPress={() => onActionPress?.(action)}
            accessibilityRole="button"
            style={styles.cardInner}
          >
            <View style={styles.iconBubble}>
              <H3 style={styles.icon}>{action.emoji}</H3>
            </View>
            <View style={styles.cardTextWrap}>
              <H3 style={styles.cardTitle}>{action.label}</H3>
              <Caption style={styles.cardSubtitle}>{action.description}</Caption>
            </View>
          </Pressable>
        </Card>
      ))}
    </View>
  );
}

export const QuickActions = memo(QuickActionsComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  cardInner: {
    flex: 1,
    alignItems: 'flex-start',
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    color: '#4338CA',
  },
  cardTextWrap: {
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    marginTop: 4,
    color: '#6b7280',
  },
});
