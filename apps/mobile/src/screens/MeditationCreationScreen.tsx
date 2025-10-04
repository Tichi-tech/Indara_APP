import { memo, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { usePlayer } from '@/hooks/usePlayer';
import { musicApi } from '@/services/musicApi';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';
import type { Track } from '@/types/music';

type GeneratedSession = {
  id?: string;
  audio_url?: string;
};

type MeditationCreationScreenProps = {
  onClose?: () => void;
  onTalkToGuide?: () => void;
  onPlaySession?: (track: Track) => void;
};

const TAGS = [
  'Mindfulness',
  'Breathing',
  'Body Scan',
  'Sleep',
  'Stress Relief',
  'Inner Peace',
  'Loving Kindness',
  'Gratitude',
  'Focus',
  'Anxiety Relief',
  'Deep Relaxation',
  'Grounding',
];

const DURATIONS = [
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
  { value: 900, label: '15 min' },
  { value: 1200, label: '20 min' },
];

function MeditationCreationScreenComponent({
  onClose,
  onTalkToGuide,
  onPlaySession,
}: MeditationCreationScreenProps) {
  const { loadAndPlay } = usePlayer();

  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [duration, setDuration] = useState(DURATIONS[1].value);
  const [useTherapist, setUseTherapist] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<GeneratedSession | null>(null);

  const summaryTitle = useMemo(() => {
    if (!selectedTags.length) return 'Custom Meditation Session';
    if (selectedTags.length === 1) return `${selectedTags[0]} Meditation`;
    return `${selectedTags[0]} & ${selectedTags[1]} Session`;
  }, [selectedTags]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  }, []);

  const resetForm = useCallback(() => {
    setDescription('');
    setSelectedTags([]);
    setDuration(DURATIONS[1].value);
    setUseTherapist(false);
    setProgress(0);
    setSession(null);
    setError(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (isGenerating) return;
    if (!description.trim() && !selectedTags.length) {
      setError('Describe the session or pick at least one focus area.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setProgress(10);

      const sessionDescription = description.trim()
        ? `${description.trim()}${selectedTags.length ? ` Focus on: ${selectedTags.join(', ')}.` : ''}`
        : `Meditation session focusing on: ${selectedTags.join(', ')}`;

      const { data, error: apiError } = await musicApi.generateMeditationSession({
        user_text: sessionDescription,
        duration_sec: duration,
        use_therapist: useTherapist,
      });

      if (apiError) throw apiError;
      setProgress(80);

      const nextSession: GeneratedSession = data ?? {};
      setSession(nextSession);
      setProgress(100);

      if (nextSession.audio_url) {
        const trackId = nextSession.id ?? `meditation-${Date.now()}`;
        const displayTitle = summaryTitle;
        const art = getSmartThumbnail(
          displayTitle,
          sessionDescription,
          `meditation ${selectedTags.join(' ')}`
        );

        const track: Track = {
          id: trackId,
          title: displayTitle,
          artist: 'Meditation Guide',
          audio_url: nextSession.audio_url,
          image_url: art,
        };

        await loadAndPlay(track, [track]);
        onPlaySession?.(track);
      }
    } catch (err: any) {
      console.warn('Meditation session generation failed', err);
      setError(err?.message ?? 'Generation failed. Try again in a moment.');
    } finally {
      setIsGenerating(false);
    }
  }, [description, duration, isGenerating, loadAndPlay, onPlaySession, selectedTags, summaryTitle, useTherapist]);

  const progressLabel = useMemo(() => {
    if (!isGenerating) return null;
    if (progress < 40) return 'Gathering calming inspiration...';
    if (progress < 80) return 'Composing guidance and breathing cues...';
    return 'Finalising your personalised session...';
  }, [isGenerating, progress]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.headerButton}>
              <Feather name="x" size={18} color="#0f172a" />
            </Pressable>
            {onTalkToGuide ? (
              <Pressable accessibilityRole="button" onPress={onTalkToGuide} style={styles.headerButton}>
                <Feather name="message-circle" size={18} color="#0f172a" />
              </Pressable>
            ) : null}
          </View>
          <View style={styles.headerTitleWrap}>
            <Feather name="feather" size={18} color="#0f172a" />
            <Text style={styles.headerTitle}>Create Meditation</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.cardLarge}>
            <Text style={styles.cardHeading}>Describe your session</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. I want help winding down after a long day"
              multiline
              editable={!isGenerating}
              style={styles.textArea}
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeading}>Focus areas</Text>
            <View style={styles.tagGrid}>
              {TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    accessibilityRole="button"
                    onPress={() => toggleTag(tag)}
                    style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                  >
                    <Text style={[styles.tagLabel, isSelected && styles.tagLabelSelected]}>{tag}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeading}>Duration</Text>
            <View style={styles.durationRow}>
              {DURATIONS.map((option) => {
                const isActive = option.value === duration;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    onPress={() => setDuration(option.value)}
                    style={[styles.durationChip, isActive && styles.durationChipActive]}
                  >
                    <Text style={[styles.durationLabel, isActive && styles.durationLabelActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.therapyRow}>
            <View>
              <Text style={styles.therapyTitle}>Include therapist guidance</Text>
              <Text style={styles.therapySubtitle}>Adds supportive reflections throughout the session</Text>
            </View>
            <Switch value={useTherapist} onValueChange={setUseTherapist} disabled={isGenerating} />
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-triangle" size={16} color="#b91c1c" />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={resetForm}>
                <Text style={styles.errorRetry}>Reset</Text>
              </Pressable>
            </View>
          ) : null}

          {isGenerating ? (
            <View style={styles.progressCard}>
              <ActivityIndicator size="small" color="#0f766e" />
              <View style={styles.progressCopy}>
                <Text style={styles.progressTitle}>Creating your meditation</Text>
                <Text style={styles.progressSubtitle}>{progressLabel}</Text>
              </View>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
          ) : null}

          {session?.audio_url ? (
            <View style={styles.resultCard}>
              <View style={styles.resultIcon}>
                <Feather name="play" size={18} color="#0f172a" />
              </View>
              <View style={styles.resultCopy}>
                <Text style={styles.resultTitle}>{summaryTitle}</Text>
                <Text style={styles.resultSubtitle}>
                  {Math.round(duration / 60)} minute guided meditation ready to play.
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={resetForm} style={styles.resultReset}>
                <Feather name="refresh-ccw" size={16} color="#0f172a" />
              </Pressable>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            style={[styles.primaryButton, isGenerating && styles.primaryButtonDisabled]}
            onPress={handleCreate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.primaryLabel}>Generate meditation session</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  headerRight: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 18,
    paddingBottom: 40,
  },
  cardLarge: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    minHeight: 160,
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 14,
  },
  textArea: {
    flex: 1,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#0f172a',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    rowGap: 10,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5f5',
    backgroundColor: '#f8fafc',
    marginHorizontal: 6,
  },
  tagChipSelected: {
    backgroundColor: '#14b8a6',
    borderColor: '#0f766e',
  },
  tagLabel: {
    fontSize: 13,
    color: '#0f172a',
  },
  tagLabelSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
  },
  durationChipActive: {
    backgroundColor: '#0f766e',
  },
  durationLabel: {
    fontSize: 13,
    color: '#0f172a',
  },
  durationLabelActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  therapyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#f0fdfa',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#99f6e4',
  },
  therapyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  therapySubtitle: {
    fontSize: 12,
    color: '#0f172a',
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#991b1b',
  },
  errorRetry: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b91c1c',
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ecfdf5',
  },
  progressCopy: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  progressSubtitle: {
    fontSize: 12,
    color: '#0f172a',
    marginTop: 2,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    gap: 14,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCopy: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#0f172a',
    marginTop: 2,
  },
  resultReset: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#5eead4',
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export const MeditationCreationScreen = memo(MeditationCreationScreenComponent);

export default MeditationCreationScreen;
