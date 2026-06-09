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
import { Ionicons } from '@expo/vector-icons';
import { useBusinessStore } from '@/store/useBusinessStore';
import { SocialPlatform, PostFrequency } from '@/types';
import { PLATFORMS } from '@/constants/platforms';
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

const FREQUENCY_OPTIONS: { id: PostFrequency; label: string; desc: string }[] = [
  { id: 'daily', label: 'Daily', desc: '7×/wk' },
  { id: '3x_week', label: '3×/week', desc: '3×/wk' },
  { id: '2x_week', label: '2×/week', desc: '2×/wk' },
  { id: 'weekly', label: 'Weekly', desc: '1×/wk' },
];

const BEST_TIMES = ['9 AM', '12 PM', '5 PM', '8 PM'];

export default function Step6Screen() {
  const { updateProfile } = useBusinessStore();

  const [enabledPlatforms, setEnabledPlatforms] = useState<Set<SocialPlatform>>(new Set());
  const [frequencies, setFrequencies] = useState<Record<SocialPlatform, PostFrequency>>(
    {} as Record<SocialPlatform, PostFrequency>,
  );
  const [selectedTimes, setSelectedTimes] = useState<Record<SocialPlatform, string[]>>(
    {} as Record<SocialPlatform, string[]>,
  );
  const [error, setError] = useState('');

  const togglePlatform = (platformId: SocialPlatform) => {
    setEnabledPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platformId)) {
        next.delete(platformId);
      } else {
        next.add(platformId);
        if (!frequencies[platformId]) {
          setFrequencies((f) => ({ ...f, [platformId]: '3x_week' }));
        }
      }
      return next;
    });
    setError('');
  };

  const setFrequency = (platform: SocialPlatform, freq: PostFrequency) => {
    setFrequencies((prev) => ({ ...prev, [platform]: freq }));
  };

  const toggleTime = (platform: SocialPlatform, time: string) => {
    setSelectedTimes((prev) => {
      const current = prev[platform] ?? [];
      const next = current.includes(time) ? current.filter((t) => t !== time) : [...current, time];
      return { ...prev, [platform]: next };
    });
  };

  const handleContinue = () => {
    if (enabledPlatforms.size === 0) {
      setError('Select at least one platform');
      return;
    }

    const activePlatforms = Array.from(enabledPlatforms);
    const preferredPostTimes: Partial<Record<SocialPlatform, string[]>> = {};
    activePlatforms.forEach((p) => {
      preferredPostTimes[p] = selectedTimes[p] ?? ['12 PM'];
    });

    const primaryFrequency = activePlatforms.length > 0
      ? frequencies[activePlatforms[0]] ?? '3x_week'
      : '3x_week';

    updateProfile({
      activePlatforms,
      contentPreferences: {
        preferredPostTimes: preferredPostTimes as Record<SocialPlatform, string[]>,
        postFrequency: primaryFrequency,
        contentMix: {},
      },
    });
    router.push('/(auth)/onboarding/step7');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <OnboardingProgress currentStep={6} totalSteps={7} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Where do you post?</Text>
          <Text style={styles.subtitle}>
            Select your platforms and set posting frequency for each
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {PLATFORMS.map((platform) => {
          const enabled = enabledPlatforms.has(platform.id);
          const freq = frequencies[platform.id] ?? '3x_week';
          const times = selectedTimes[platform.id] ?? [];

          return (
            <View key={platform.id} style={styles.platformCard}>
              <TouchableOpacity
                style={styles.platformHeader}
                onPress={() => togglePlatform(platform.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.platformIconBg, { backgroundColor: `${platform.color}22` }]}>
                  <Ionicons
                    name={platform.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={platform.color}
                  />
                </View>
                <View style={styles.platformInfo}>
                  <Text style={styles.platformName}>{platform.name}</Text>
                  <Text style={styles.platformDesc} numberOfLines={1}>
                    {platform.audienceStrengths.slice(0, 2).join(' · ')}
                  </Text>
                </View>
                <View style={[styles.toggleSwitch, enabled && styles.toggleSwitchOn]}>
                  <View style={[styles.toggleThumb, enabled && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>

              {enabled && (
                <View style={styles.platformSettings}>
                  <Text style={styles.settingLabel}>Posting frequency</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.freqRow}
                  >
                    {FREQUENCY_OPTIONS.map((f) => (
                      <TouchableOpacity
                        key={f.id}
                        style={[styles.freqChip, freq === f.id && styles.freqChipSelected]}
                        onPress={() => setFrequency(platform.id, f.id)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.freqChipText,
                            freq === f.id && styles.freqChipTextSelected,
                          ]}
                        >
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={[styles.settingLabel, { marginTop: 12 }]}>Best posting times</Text>
                  <View style={styles.timesRow}>
                    {BEST_TIMES.map((time) => {
                      const selected = times.includes(time);
                      return (
                        <TouchableOpacity
                          key={time}
                          style={[styles.timeChip, selected && styles.timeChipSelected]}
                          onPress={() => toggleTime(platform.id, time)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[styles.timeChipText, selected && styles.timeChipTextSelected]}
                          >
                            {time}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          );
        })}
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
  errorText: { fontSize: 13, color: COLORS.error, fontWeight: '500', marginBottom: 12 },
  platformCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  platformIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformInfo: { flex: 1 },
  platformName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  platformDesc: { fontSize: 12, color: COLORS.textMuted },
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
  toggleThumbOn: { backgroundColor: COLORS.textPrimary, alignSelf: 'flex-end' },
  platformSettings: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  freqRow: { gap: 8 },
  freqChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  freqChipSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.primary,
  },
  freqChipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  freqChipTextSelected: { color: COLORS.primary },
  timesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  timeChipSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.primary,
  },
  timeChipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  timeChipTextSelected: { color: COLORS.primary },
  footer: { padding: 24, paddingBottom: 32 },
});
