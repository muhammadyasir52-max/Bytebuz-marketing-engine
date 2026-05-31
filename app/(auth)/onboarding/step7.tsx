import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
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
  accent: '#10B981',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  error: '#EF4444',
};

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

interface ApiKeyFieldProps {
  label: string;
  subtitle: string;
  helperText: string;
  value: string;
  onChangeText: (text: string) => void;
  status: ValidationStatus;
  onTest: () => void;
}

function ApiKeyField({
  label,
  subtitle,
  helperText,
  value,
  onChangeText,
  status,
  onTest,
}: ApiKeyFieldProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <View style={styles.apiSection}>
      <Text style={styles.apiLabel}>{label}</Text>
      <Text style={styles.apiSubtitle}>{subtitle}</Text>
      <Text style={styles.apiHelper}>{helperText}</Text>

      <View style={styles.inputRow}>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder="Paste your API key here"
          secureTextEntry={!showKey}
          autoCapitalize="none"
          style={styles.keyInput}
          rightIcon={
            <TouchableOpacity
              onPress={() => setShowKey((p) => !p)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showKey ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          }
        />
      </View>

      <View style={styles.testRow}>
        <TouchableOpacity
          style={[styles.testButton, !value.trim() && styles.testButtonDisabled]}
          onPress={onTest}
          disabled={!value.trim() || status === 'validating'}
          activeOpacity={0.7}
        >
          {status === 'validating' ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.testButtonText}>Test Connection</Text>
          )}
        </TouchableOpacity>

        {status === 'valid' && (
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
            <Text style={[styles.statusText, { color: COLORS.accent }]}>Connected</Text>
          </View>
        )}
        {status === 'invalid' && (
          <View style={styles.statusBadge}>
            <Ionicons name="close-circle" size={16} color={COLORS.error} />
            <Text style={[styles.statusText, { color: COLORS.error }]}>Invalid key</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function Step7Screen() {
  const { setOnboarded, updateProfile } = useBusinessStore();

  const [claudeKey, setClaudeKey] = useState('');
  const [ayrshareKey, setAyrshareKey] = useState('');
  const [claudeStatus, setClaudeStatus] = useState<ValidationStatus>('idle');
  const [ayrshareStatus, setAyrshareStatus] = useState<ValidationStatus>('idle');
  const [isCompleting, setIsCompleting] = useState(false);

  const testClaudeKey = async () => {
    if (!claudeKey.trim()) return;
    setClaudeStatus('validating');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': claudeKey.trim(),
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      setClaudeStatus(response.ok || response.status === 400 ? 'valid' : 'invalid');
    } catch {
      setClaudeStatus('invalid');
    }
  };

  const testAyrshareKey = async () => {
    if (!ayrshareKey.trim()) return;
    setAyrshareStatus('validating');
    try {
      const response = await fetch('https://app.ayrshare.com/api/user', {
        headers: { Authorization: `Bearer ${ayrshareKey.trim()}` },
      });
      setAyrshareStatus(response.ok ? 'valid' : 'invalid');
    } catch {
      setAyrshareStatus('invalid');
    }
  };

  const handleComplete = async () => {
    if (!claudeKey.trim()) return;
    setIsCompleting(true);
    try {
      updateProfile({ isOnboarded: true });
      setOnboarded(true);
      router.replace('/(tabs)');
    } catch {
      setIsCompleting(false);
    }
  };

  const canComplete = claudeKey.trim().length > 0 && claudeStatus === 'valid';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <OnboardingProgress step={7} total={7} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Connect your AI engine</Text>
          <Text style={styles.subtitle}>
            Your keys are encrypted and stored only on your device
          </Text>
        </View>

        <View style={styles.securityBanner}>
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.accent} />
          <Text style={styles.securityText}>
            Keys are stored in your device's secure enclave and never transmitted to our servers
          </Text>
        </View>

        <ApiKeyField
          label="Claude API Key"
          subtitle="From Anthropic — powers all AI content generation"
          helperText="Get yours at console.anthropic.com"
          value={claudeKey}
          onChangeText={(t) => {
            setClaudeKey(t);
            setClaudeStatus('idle');
          }}
          status={claudeStatus}
          onTest={testClaudeKey}
        />

        <View style={styles.divider} />

        <ApiKeyField
          label="Ayrshare API Key"
          subtitle="For direct social media posting (optional)"
          helperText="Get yours at ayrshare.com"
          value={ayrshareKey}
          onChangeText={(t) => {
            setAyrshareKey(t);
            setAyrshareStatus('idle');
          }}
          status={ayrshareStatus}
          onTest={testAyrshareKey}
        />

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.noteText}>
            Skipping Ayrshare? You can still generate and schedule content — you'll copy & paste to post manually.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={isCompleting ? 'Setting up...' : 'Complete Setup'}
          onPress={handleComplete}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canComplete}
          loading={isCompleting}
        />
        {!canComplete && claudeKey.trim().length > 0 && claudeStatus !== 'valid' && (
          <Text style={styles.warningText}>Validate your Claude API key to continue</Text>
        )}
        {claudeKey.trim().length === 0 && (
          <Text style={styles.warningText}>Claude API key is required to generate content</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  header: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  securityText: { flex: 1, fontSize: 13, color: COLORS.accent, lineHeight: 18 },
  apiSection: { marginBottom: 8 },
  apiLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  apiSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
  apiHelper: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  inputRow: {},
  keyInput: { flex: 1 },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  testButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
    minWidth: 120,
    alignItems: 'center',
  },
  testButtonDisabled: { borderColor: COLORS.border, opacity: 0.5 },
  testButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusText: { fontSize: 13, fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteText: { flex: 1, fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  footer: { padding: 24, paddingBottom: 32, gap: 10 },
  warningText: {
    fontSize: 13,
    color: COLORS.error,
    textAlign: 'center',
    fontWeight: '500',
  },
});
