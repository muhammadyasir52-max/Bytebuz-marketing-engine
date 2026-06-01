import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBusinessStore } from '@/store/useBusinessStore';
import { BrandTone, EmojiUsage } from '@/types';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import TagInput from '@/components/onboarding/TagInput';

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  error: '#EF4444',
};

const BRAND_TONES: { id: BrandTone; label: string; emoji: string }[] = [
  { id: 'professional', label: 'Professional', emoji: '💼' },
  { id: 'casual', label: 'Casual', emoji: '😊' },
  { id: 'witty', label: 'Witty', emoji: '😄' },
  { id: 'bold', label: 'Bold', emoji: '🔥' },
  { id: 'empathetic', label: 'Empathetic', emoji: '💙' },
  { id: 'authoritative', label: 'Authoritative', emoji: '⚡' },
  { id: 'inspirational', label: 'Inspirational', emoji: '✨' },
];

const EMOJI_OPTIONS: { id: EmojiUsage; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'heavy', label: 'Heavy' },
];

export default function Step3Screen() {
  const { updateProfile } = useBusinessStore();

  const [selectedTones, setSelectedTones] = useState<BrandTone[]>([]);
  const [shortSentences, setShortSentences] = useState(true);
  const [datadriven, setDataDriven] = useState(false);
  const [storytelling, setStorytelling] = useState(false);
  const [emojiUsage, setEmojiUsage] = useState<EmojiUsage>('minimal');
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([]);
  const [examplePost, setExamplePost] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTone = (tone: BrandTone) => {
    setSelectedTones((prev) =>
      prev.includes(tone) ? prev.filter((t) => t !== tone) : [...prev, tone],
    );
    if (errors.tones) setErrors((p) => ({ ...p, tones: '' }));
  };

  const handleContinue = () => {
    if (selectedTones.length === 0) {
      setErrors({ tones: 'Select at least one brand tone' });
      return;
    }

    const styleTokens: string[] = [];
    if (shortSentences) styleTokens.push('short_sentences');
    else styleTokens.push('long_form');
    if (datadriven) styleTokens.push('data_driven');
    if (storytelling) styleTokens.push('storytelling');

    updateProfile({
      brandVoice: {
        tone: selectedTones,
        writingStyle: styleTokens.join(','),
        wordsToAvoid,
        exampleContent: examplePost.trim() ? [examplePost.trim()] : [],
        emojiUsage,
      },
    });
    router.push('/(auth)/onboarding/step4');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <OnboardingProgress currentStep={3} totalSteps={7} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>What's your brand's voice?</Text>
          <Text style={styles.subtitle}>
            Your brand voice shapes every piece of content our AI creates for you
          </Text>
        </View>

        {/* Tone Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Brand Tone *</Text>
          <Text style={styles.sectionHint}>Select all that apply</Text>
          {errors.tones ? <Text style={styles.errorText}>{errors.tones}</Text> : null}
          <View style={styles.toneGrid}>
            {BRAND_TONES.map((tone) => {
              const selected = selectedTones.includes(tone.id);
              return (
                <TouchableOpacity
                  key={tone.id}
                  style={[styles.toneChip, selected && styles.toneChipSelected]}
                  onPress={() => toggleTone(tone.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toneEmoji}>{tone.emoji}</Text>
                  <Text style={[styles.toneLabel, selected && styles.toneLabelSelected]}>
                    {tone.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Writing Style Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Writing Style</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Sentence length</Text>
              <Text style={styles.toggleSubtitle}>
                {shortSentences ? 'Short & punchy' : 'Long-form & detailed'}
              </Text>
            </View>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segment, shortSentences && styles.segmentActive]}
                onPress={() => setShortSentences(true)}
              >
                <Text style={[styles.segmentText, shortSentences && styles.segmentTextActive]}>
                  Short
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, !shortSentences && styles.segmentActive]}
                onPress={() => setShortSentences(false)}
              >
                <Text style={[styles.segmentText, !shortSentences && styles.segmentTextActive]}>
                  Long
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ToggleRow
            label="Data-driven"
            subtitle="Use stats and numbers to support claims"
            value={datadriven}
            onToggle={() => setDataDriven((p) => !p)}
          />

          <ToggleRow
            label="Storytelling"
            subtitle="Weave narratives and personal anecdotes"
            value={storytelling}
            onToggle={() => setStorytelling((p) => !p)}
          />
        </View>

        {/* Emoji Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Emoji Usage</Text>
          <View style={styles.emojiSegment}>
            {EMOJI_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.emojiOption, emojiUsage === opt.id && styles.emojiOptionActive]}
                onPress={() => setEmojiUsage(opt.id)}
              >
                <Text
                  style={[
                    styles.emojiOptionText,
                    emojiUsage === opt.id && styles.emojiOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Words to Avoid */}
        <View style={styles.section}>
          <TagInput
            label="Words/phrases to AVOID"
            tags={wordsToAvoid}
            onTagsChange={setWordsToAvoid}
            maxTags={20}
            placeholder="Type a word and press enter"
            hint="e.g. synergy, leverage, circle back"
          />
        </View>

        {/* Example Post */}
        <View style={styles.section}>
          <Input
            label="Paste a post you love (optional)"
            value={examplePost}
            onChangeText={setExamplePost}
            placeholder="Paste a post that captures your ideal tone..."
            multiline
            numberOfLines={4}
            hint="This teaches the AI your style"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={handleContinue}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

interface ToggleRowProps {
  label: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, subtitle, value, onToggle }: ToggleRowProps) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleTitle}>{label}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.toggleSwitch, value && styles.toggleSwitchOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  header: { marginBottom: 28 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  sectionHint: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
    marginBottom: 8,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  toneChipSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: COLORS.primary,
  },
  toneEmoji: { fontSize: 16 },
  toneLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  toneLabelSelected: { color: COLORS.primary, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleInfo: { flex: 1, marginRight: 16 },
  toggleTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  toggleSubtitle: { fontSize: 13, color: COLORS.textMuted },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentActive: { backgroundColor: COLORS.primary },
  segmentText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  segmentTextActive: { color: COLORS.textPrimary },
  emojiSegment: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  emojiOptionActive: { backgroundColor: COLORS.primary },
  emojiOptionText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  emojiOptionTextActive: { color: COLORS.textPrimary },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleSwitchOn: { backgroundColor: COLORS.primary },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.textSecondary,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    backgroundColor: COLORS.textPrimary,
    alignSelf: 'flex-end',
  },
  footer: { padding: 24, paddingBottom: 32 },
});
