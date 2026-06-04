import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useBusinessStore } from '@/store/useBusinessStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePostStore } from '@/store/usePostStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { ContentFramework, HookType } from '@/types';

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  accent: '#10B981',
  error: '#EF4444',
};

const FRAMEWORKS: ContentFramework[] = ['AIDA', 'PAS', 'BAB', 'PPPP'];
const HOOK_TYPES: HookType[] = [
  'relatable_story',
  'controversial_opinion',
  'surprising_stat',
  'how_to',
  'listicle',
  'question',
  'bold_claim',
  'pattern_interrupt',
];

const LEAD_TIMES = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hr' },
  { value: 120, label: '2 hr' },
];

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  dangerous?: boolean;
}

function SettingRow({ label, value, onPress, rightElement, dangerous }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.settingLabel, dangerous && styles.settingLabelDanger]}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {rightElement ?? (onPress && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      ))}
    </TouchableOpacity>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { profile, clearProfile } = useBusinessStore();
  const {
    notificationsEnabled,
    dailyDigestEnabled,
    reminderLeadTimeMinutes,
    defaultFramework,
    defaultHookType,
    autoHashtags,
    updateSettings,
    resetSettings,
  } = useSettingsStore();
  const { drafts, scheduled, posted } = usePostStore();
  const { clearCache } = useAnalyticsStore();

  const [showFrameworkPicker, setShowFrameworkPicker] = useState(false);
  const [showHookPicker, setShowHookPicker] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleExportData = async () => {
    const data = {
      profile,
      posts: { drafts, scheduled, posted },
      settings: {
        notificationsEnabled,
        dailyDigestEnabled,
        reminderLeadTimeMinutes,
        defaultFramework,
        defaultHookType,
        autoHashtags,
      },
      exportedAt: new Date().toISOString(),
    };

    try {
      await Share.share({
        message: JSON.stringify(data, null, 2),
        title: 'Bytebuz Data Export',
      });
    } catch {
      Alert.alert('Export failed', 'Could not export your data. Please try again.');
    }
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete your profile, posts, and all settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            clearProfile();
            resetSettings();
            clearCache();
            router.replace('/(auth)/welcome');
          },
        },
      ],
    );
  };

  const maskedKey = (key?: string) => {
    if (!key || key.length === 0) return 'Not set';
    return '••••••••' + key.slice(-4);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        <Section title="Business Profile">
          <SettingRow
            label="Edit Business Profile"
            onPress={() => router.push('/settings/profile' as any)}
          />
        </Section>

        <Section title="API Connections">
          <SettingRow
            label="Claude API Key"
            value={maskedKey(profile?.isOnboarded ? 'configured' : '')}
            onPress={() => router.push('/settings/profile' as any)}
          />
          <View style={styles.separator} />
          <SettingRow
            label="Ayrshare API Key"
            value={maskedKey(undefined)}
            onPress={() => router.push('/settings/profile' as any)}
          />
          <View style={styles.separator} />
          <SettingRow
            label="Manage Social Accounts"
            onPress={() => router.push('/connectors')}
          />
        </Section>

        <Section title="Content Defaults">
          <SettingRow
            label="Default Framework"
            value={defaultFramework}
            onPress={() => setShowFrameworkPicker(!showFrameworkPicker)}
          />
          {showFrameworkPicker && (
            <View style={styles.pickerList}>
              {FRAMEWORKS.map((fw) => (
                <TouchableOpacity
                  key={fw}
                  style={styles.pickerItem}
                  onPress={() => {
                    updateSettings({ defaultFramework: fw });
                    setShowFrameworkPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      defaultFramework === fw && styles.pickerItemTextActive,
                    ]}
                  >
                    {fw}
                  </Text>
                  {defaultFramework === fw && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.separator} />
          <SettingRow
            label="Default Hook Type"
            value={defaultHookType.replace(/_/g, ' ')}
            onPress={() => setShowHookPicker(!showHookPicker)}
          />
          {showHookPicker && (
            <View style={styles.pickerList}>
              {HOOK_TYPES.map((ht) => (
                <TouchableOpacity
                  key={ht}
                  style={styles.pickerItem}
                  onPress={() => {
                    updateSettings({ defaultHookType: ht });
                    setShowHookPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      defaultHookType === ht && styles.pickerItemTextActive,
                    ]}
                  >
                    {ht.replace(/_/g, ' ')}
                  </Text>
                  {defaultHookType === ht && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.separator} />
          <SettingRow
            label="Auto-Hashtags"
            rightElement={
              <Switch
                value={autoHashtags}
                onValueChange={(v) => updateSettings({ autoHashtags: v })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.textPrimary}
              />
            }
          />
        </Section>

        <Section title="Notifications">
          <SettingRow
            label="Enable Notifications"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.textPrimary}
              />
            }
          />
          <View style={styles.separator} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Reminder Lead Time</Text>
            <View style={styles.leadTimeRow}>
              {LEAD_TIMES.map((lt) => (
                <TouchableOpacity
                  key={lt.value}
                  style={[
                    styles.leadTimeChip,
                    reminderLeadTimeMinutes === lt.value && styles.leadTimeChipActive,
                  ]}
                  onPress={() => updateSettings({ reminderLeadTimeMinutes: lt.value })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.leadTimeText,
                      reminderLeadTimeMinutes === lt.value && styles.leadTimeTextActive,
                    ]}
                  >
                    {lt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.separator} />
          <SettingRow
            label="Daily Digest"
            rightElement={
              <Switch
                value={dailyDigestEnabled}
                onValueChange={(v) => updateSettings({ dailyDigestEnabled: v })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.textPrimary}
              />
            }
          />
        </Section>

        <Section title="Security">
          <SettingRow
            label="Security Center"
            value="Audit · Rate Limits · Key Health"
            onPress={() => router.push('/security' as any)}
          />
        </Section>

        <Section title="App">
          <SettingRow label="Version" value={`v${appVersion}`} />
          <View style={styles.separator} />
          <SettingRow label="Export My Data" onPress={handleExportData} />
          <View style={styles.separator} />
          <SettingRow
            label="Reset All Data"
            onPress={handleResetAllData}
            dangerous
          />
        </Section>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    paddingTop: 16,
    marginBottom: 24,
  },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  settingLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500', flex: 1 },
  settingLabelDanger: { color: COLORS.error },
  settingValue: { fontSize: 14, color: COLORS.textMuted, marginRight: 8 },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
  pickerList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemText: { fontSize: 15, color: COLORS.textSecondary, textTransform: 'capitalize' },
  pickerItemTextActive: { color: COLORS.primary, fontWeight: '600' },
  leadTimeRow: { flexDirection: 'row', gap: 8 },
  leadTimeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leadTimeChipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.primary,
  },
  leadTimeText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  leadTimeTextActive: { color: COLORS.primary },
  bottomPadding: { height: 20 },
});
