import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessStore } from '@/store/useBusinessStore';
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

const NICHES = [
  'SaaS / Software',
  'E-commerce',
  'Coaching / Consulting',
  'Restaurant / Food',
  'Fitness / Wellness',
  'Real Estate',
  'Digital Marketing',
  'Finance / Fintech',
  'Education / EdTech',
  'Healthcare',
  'Beauty / Fashion',
  'Travel / Hospitality',
  'Legal Services',
  'Photography',
  'Other',
];

export default function Step1Screen() {
  const { updateProfile } = useBusinessStore();

  const [businessName, setBusinessName] = useState('');
  const [niche, setNiche] = useState('');
  const [customNiche, setCustomNiche] = useState('');
  const [showCustomNiche, setShowCustomNiche] = useState(false);
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [showNichePicker, setShowNichePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!businessName.trim()) newErrors.businessName = 'Business name is required';
    const finalNiche = showCustomNiche ? customNiche.trim() : niche;
    if (!finalNiche) newErrors.niche = 'Please select or enter your niche';
    if (!description.trim()) newErrors.description = 'Please describe your business';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    const finalNiche = showCustomNiche ? customNiche.trim() : niche;
    updateProfile({
      businessName: businessName.trim(),
      niche: finalNiche,
      description: description.trim(),
      website: website.trim() || undefined,
    });
    router.push('/(auth)/onboarding/step2');
  };

  const handleSelectNiche = (selected: string) => {
    if (selected === 'Other') {
      setShowCustomNiche(true);
      setNiche('');
    } else {
      setNiche(selected);
      setShowCustomNiche(false);
      setCustomNiche('');
    }
    setShowNichePicker(false);
    setErrors((prev) => ({ ...prev, niche: '' }));
  };

  const displayNiche = showCustomNiche
    ? customNiche || 'Enter custom niche...'
    : niche || 'Select your niche';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <OnboardingProgress step={1} total={7} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tell us about your business</Text>
          <Text style={styles.subtitle}>
            This helps our AI create content that's perfectly tailored to you
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Business Name *"
            value={businessName}
            onChangeText={(t) => {
              setBusinessName(t);
              if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: '' }));
            }}
            placeholder="e.g. Bytebuz Marketing"
            error={errors.businessName}
            autoCapitalize="words"
          />

          {/* Niche Picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your Niche *</Text>
            <TouchableOpacity
              style={[styles.pickerButton, errors.niche ? styles.pickerButtonError : null]}
              onPress={() => setShowNichePicker(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  !niche && !showCustomNiche ? styles.pickerPlaceholder : null,
                ]}
              >
                {displayNiche}
              </Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {errors.niche ? <Text style={styles.errorText}>{errors.niche}</Text> : null}

            {showCustomNiche && (
              <View style={styles.customNicheContainer}>
                <Input
                  value={customNiche}
                  onChangeText={setCustomNiche}
                  placeholder="Describe your niche..."
                  autoCapitalize="words"
                />
              </View>
            )}
          </View>

          <Input
            label="Describe your business *"
            value={description}
            onChangeText={(t) => {
              setDescription(t);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="What do you sell and who do you serve?"
            multiline
            numberOfLines={3}
            maxLength={300}
            hint="What do you sell and who do you serve?"
            error={errors.description}
          />

          <Input
            label="Website URL (optional)"
            value={website}
            onChangeText={setWebsite}
            placeholder="https://yourbusiness.com"
            keyboardType="url"
            autoCapitalize="none"
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

      {/* Niche Picker Modal */}
      <Modal
        visible={showNichePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNichePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNichePicker(false)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select Your Niche</Text>
          <FlatList
            data={NICHES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.nicheItem, niche === item ? styles.nicheItemSelected : null]}
                onPress={() => handleSelectNiche(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.nicheItemText,
                    niche === item ? styles.nicheItemTextSelected : null,
                  ]}
                >
                  {item}
                </Text>
                {niche === item && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.nicheList}
          />
        </View>
      </Modal>
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
  fieldGroup: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  pickerButtonError: {
    borderColor: COLORS.error,
  },
  pickerButtonText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  pickerPlaceholder: {
    color: COLORS.textMuted,
  },
  customNicheContainer: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  nicheList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  nicheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  nicheItemSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  nicheItemText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  nicheItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
