import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBusinessStore } from '@/store/useBusinessStore';
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
  secondary: '#3B82F6',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  error: '#EF4444',
};

export default function Step2Screen() {
  const { updateProfile } = useBusinessStore();

  const [demographic, setDemographic] = useState('');
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [desires, setDesires] = useState<string[]>([]);
  const [jobToBeDone, setJobToBeDone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!demographic.trim()) newErrors.demographic = 'Please describe your primary demographic';
    if (painPoints.length === 0) newErrors.painPoints = 'Add at least one pain point';
    if (desires.length === 0) newErrors.desires = 'Add at least one desire';
    if (!jobToBeDone.trim()) newErrors.jobToBeDone = 'Please describe the job to be done';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateProfile({
      targetAudience: {
        primaryDemographic: demographic.trim(),
        painPoints,
        desires,
        jobToBeDone: jobToBeDone.trim(),
      },
    });
    router.push('/(auth)/onboarding/step3');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <OnboardingProgress currentStep={2} totalSteps={7} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Who are your customers?</Text>
          <Text style={styles.subtitle}>
            Understanding your audience helps us craft content that truly connects
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Input
              label="Primary demographic *"
              value={demographic}
              onChangeText={(t) => {
                setDemographic(t);
                if (errors.demographic) setErrors((p) => ({ ...p, demographic: '' }));
              }}
              placeholder="e.g. 25-40 year old founders"
              hint="Describe who your ideal customer is"
              error={errors.demographic}
            />
          </View>

          <View style={styles.fieldGroup}>
            <TagInput
              label="Their top pain points *"
              tags={painPoints}
              onTagsChange={(tags) => {
                setPainPoints(tags);
                if (errors.painPoints) setErrors((p) => ({ ...p, painPoints: '' }));
              }}
              maxTags={5}
              placeholder="Type a pain point and press enter"
              hint="Add up to 5 pain points your customers experience"
            />
          </View>

          <View style={styles.fieldGroup}>
            <TagInput
              label="Their deepest desires *"
              tags={desires}
              onTagsChange={(tags) => {
                setDesires(tags);
                if (errors.desires) setErrors((p) => ({ ...p, desires: '' }));
              }}
              maxTags={5}
              placeholder="Type a desire and press enter"
              hint="What do they truly want to achieve?"
            />
          </View>

          <Input
            label="Job to be done *"
            value={jobToBeDone}
            onChangeText={(t) => {
              setJobToBeDone(t);
              if (errors.jobToBeDone) setErrors((p) => ({ ...p, jobToBeDone: '' }));
            }}
            placeholder="e.g. Grow my business without working 80-hour weeks"
            hint="What does your customer really want to accomplish? (one sentence)"
            error={errors.jobToBeDone}
            multiline
            numberOfLines={2}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {},
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
});
