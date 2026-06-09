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
import { MarketingGoal, MarketingGoalType } from '@/types';
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

const GOAL_OPTIONS: {
  id: MarketingGoalType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'brand_awareness',
    label: 'Brand Awareness',
    description: 'Get your name out there',
    icon: 'megaphone-outline',
  },
  {
    id: 'lead_generation',
    label: 'Lead Generation',
    description: 'Attract qualified prospects',
    icon: 'funnel-outline',
  },
  {
    id: 'sales',
    label: 'Drive Sales',
    description: 'Convert followers to buyers',
    icon: 'cart-outline',
  },
  {
    id: 'community',
    label: 'Build Community',
    description: 'Create loyal brand advocates',
    icon: 'people-outline',
  },
  {
    id: 'traffic',
    label: 'Website Traffic',
    description: 'Send visitors to your site',
    icon: 'bar-chart-outline',
  },
];

export default function Step5Screen() {
  const { updateProfile } = useBusinessStore();
  const [selectedGoals, setSelectedGoals] = useState<Set<MarketingGoalType>>(new Set());
  const [kpiTargets, setKpiTargets] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const toggleGoal = (goalId: MarketingGoalType) => {
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
    setError('');
  };

  const handleContinue = () => {
    if (selectedGoals.size === 0) {
      setError('Select at least one goal');
      return;
    }

    const goals: MarketingGoal[] = GOAL_OPTIONS
      .filter((g) => selectedGoals.has(g.id))
      .map((g) => ({
        type: g.id,
        description: g.description,
        kpiTarget: kpiTargets[g.id]?.trim() || undefined,
      }));

    updateProfile({ goals });
    router.push('/(auth)/onboarding/step6');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <OnboardingProgress currentStep={5} totalSteps={7} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>What are you trying to achieve?</Text>
          <Text style={styles.subtitle}>
            Select your primary goals. Our AI will prioritise content that drives these outcomes.
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.goalsGrid}>
          {GOAL_OPTIONS.map((goal) => {
            const selected = selectedGoals.has(goal.id);
            return (
              <View key={goal.id} style={styles.goalWrapper}>
                <TouchableOpacity
                  style={[styles.goalCard, selected && styles.goalCardSelected]}
                  onPress={() => toggleGoal(goal.id)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.goalIconBg, selected && styles.goalIconBgSelected]}>
                    <Ionicons
                      name={goal.icon}
                      size={28}
                      color={selected ? COLORS.primary : COLORS.textMuted}
                    />
                  </View>
                  <Text style={[styles.goalLabel, selected && styles.goalLabelSelected]}>
                    {goal.label}
                  </Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                  {selected && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    </View>
                  )}
                </TouchableOpacity>

                {selected && (
                  <View style={styles.kpiContainer}>
                    <Input
                      value={kpiTargets[goal.id] ?? ''}
                      onChangeText={(t) =>
                        setKpiTargets((prev) => ({ ...prev, [goal.id]: t }))
                      }
                      placeholder="e.g. 10K followers by Dec (optional)"
                      hint="What's your target?"
                    />
                  </View>
                )}
              </View>
            );
          })}
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
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '500',
    marginBottom: 12,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalWrapper: { width: '47%' },
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'flex-start',
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  goalIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(160, 160, 192, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalIconBgSelected: { backgroundColor: 'rgba(124, 58, 237, 0.15)' },
  goalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  goalLabelSelected: { color: COLORS.primary },
  goalDescription: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16 },
  checkmark: { position: 'absolute', top: 10, right: 10 },
  kpiContainer: { marginTop: 8 },
  footer: { padding: 24, paddingBottom: 32 },
});
