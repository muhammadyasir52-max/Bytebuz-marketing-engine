import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessStore } from '@/store/useBusinessStore';
import { Competitor, SocialPlatform } from '@/types';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';

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

const PLATFORMS: { id: SocialPlatform; label: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: 'logo-instagram' },
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin' },
  { id: 'twitter', label: 'X (Twitter)', icon: 'logo-twitter' },
  { id: 'tiktok', label: 'TikTok', icon: 'musical-notes' },
  { id: 'youtube', label: 'YouTube', icon: 'logo-youtube' },
];

interface CompetitorEntry extends Partial<Competitor> {
  tempId: string;
}

function makeEntry(): CompetitorEntry {
  return {
    tempId: Math.random().toString(36).slice(2),
    platform: 'instagram',
    handle: '',
    notes: '',
  };
}

export default function Step4Screen() {
  const { updateProfile } = useBusinessStore();
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([makeEntry()]);
  const [platformPickerIndex, setPlatformPickerIndex] = useState<number | null>(null);

  const addCompetitor = () => {
    if (competitors.length >= 5) return;
    setCompetitors((prev) => [...prev, makeEntry()]);
  };

  const removeCompetitor = (tempId: string) => {
    Alert.alert('Remove Competitor', 'Remove this competitor?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          setCompetitors((prev) => prev.filter((c) => c.tempId !== tempId)),
      },
    ]);
  };

  const updateCompetitor = (tempId: string, field: keyof Omit<CompetitorEntry, 'tempId'>, value: string) => {
    setCompetitors((prev) =>
      prev.map((c) => (c.tempId === tempId ? { ...c, [field]: value } : c)),
    );
  };

  const handleContinue = () => {
    const validCompetitors: Competitor[] = competitors
      .filter((c) => c.handle && c.handle.trim() !== '')
      .map((c) => ({
        handle: c.handle!.trim(),
        platform: c.platform as SocialPlatform,
        notes: c.notes?.trim() ?? '',
      }));

    updateProfile({ competitors: validCompetitors });
    router.push('/(auth)/onboarding/step5');
  };

  const handleSkip = () => {
    updateProfile({ competitors: [] });
    router.push('/(auth)/onboarding/step5');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <OnboardingProgress step={4} total={7} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Know your competition</Text>
          <Text style={styles.subtitle}>
            Add up to 5 competitors. We'll position your content against them.
          </Text>
        </View>

        {competitors.map((comp, index) => (
          <View key={comp.tempId} style={styles.competitorCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Competitor {index + 1}</Text>
              {competitors.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeCompetitor(comp.tempId)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>

            {/* Platform Selector */}
            <Text style={styles.fieldLabel}>Platform</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.platformRow}
              style={styles.platformScroll}
            >
              {PLATFORMS.map((p) => {
                const selected = comp.platform === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.platformChip, selected && styles.platformChipSelected]}
                    onPress={() => updateCompetitor(comp.tempId, 'platform', p.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={p.icon as keyof typeof Ionicons.glyphMap}
                      size={14}
                      color={selected ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={[styles.platformChipText, selected && styles.platformChipTextSelected]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Input
              label="Handle / Username"
              value={comp.handle ?? ''}
              onChangeText={(t) => updateCompetitor(comp.tempId, 'handle', t)}
              placeholder="@username or profile URL"
              autoCapitalize="none"
            />

            <Input
              label="Notes (optional)"
              value={comp.notes ?? ''}
              onChangeText={(t) => updateCompetitor(comp.tempId, 'notes', t)}
              placeholder="What do they do well?"
              multiline
              numberOfLines={2}
            />
          </View>
        ))}

        {competitors.length < 5 && (
          <TouchableOpacity style={styles.addButton} onPress={addCompetitor} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.addButtonText}>Add Competitor</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={handleContinue}
          variant="primary"
          size="lg"
          fullWidth
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  header: { marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  competitorCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  platformScroll: { marginBottom: 4 },
  platformRow: { gap: 8, paddingBottom: 4 },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 5,
  },
  platformChipSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.primary,
  },
  platformChipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  platformChipTextSelected: { color: COLORS.primary, fontWeight: '600' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 8,
  },
  addButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  footer: { padding: 24, paddingBottom: 32, gap: 12 },
  skipButton: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '500' },
});
