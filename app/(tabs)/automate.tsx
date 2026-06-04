import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAutomation, CreateRuleParams } from '@/hooks/useAutomation';
import { useBusinessStore } from '@/store/useBusinessStore';
import { PLATFORMS } from '@/constants/platforms';
import { CONTENT_TYPES } from '@/constants/contentTypes';
import { HOOK_TYPE_DEFINITIONS } from '@/constants/hookTypes';
import {
  AutomationRule,
  AutomationRun,
  AutomationFrequency,
  AutomationScheduleType,
  ContentFramework,
  ContentType,
  HookType,
  SocialPlatform,
} from '@/types';

dayjs.extend(relativeTime);

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  primaryDim: 'rgba(124, 58, 237, 0.15)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  accent: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const FRAMEWORKS: ContentFramework[] = ['AIDA', 'PAS', 'BAB', 'PPPP'];

const SCHEDULE_TYPES: { id: AutomationScheduleType; label: string; desc: string }[] = [
  { id: 'immediate', label: 'Run Once Now', desc: 'Generates and posts immediately' },
  { id: 'once', label: 'Scheduled Once', desc: 'Posts at a specific date & time' },
  { id: 'recurring', label: 'Recurring', desc: 'Posts on a set schedule' },
];

const FREQUENCIES: { id: AutomationFrequency; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: '3x_week', label: '3x / Week' },
  { id: 'weekly', label: 'Weekly' },
];

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="repeat" size={36} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Automations Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create rules to auto-generate and post content across all your platforms on autopilot.
      </Text>
      <TouchableOpacity style={styles.emptyCreateBtn} onPress={onCreate} activeOpacity={0.8}>
        <Ionicons name="add" size={18} color="#FFF" />
        <Text style={styles.emptyCreateBtnText}>Create Automation</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Platform Dots ────────────────────────────────────────────────────────────

function PlatformDots({ platforms }: { platforms: SocialPlatform[] }) {
  return (
    <View style={styles.platformDots}>
      {platforms.slice(0, 5).map((p) => {
        const cfg = PLATFORMS.find((x) => x.id === p);
        return (
          <View key={p} style={[styles.platformDot, { backgroundColor: cfg?.color ?? COLORS.primary }]}>
            <Ionicons
              name={cfg?.icon as keyof typeof Ionicons.glyphMap}
              size={10}
              color="#FFF"
            />
          </View>
        );
      })}
      {platforms.length > 5 && (
        <View style={[styles.platformDot, { backgroundColor: COLORS.textMuted }]}>
          <Text style={{ fontSize: 8, color: '#FFF', fontWeight: '700' }}>+{platforms.length - 5}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Rule Card ────────────────────────────────────────────────────────────────

interface RuleCardProps {
  rule: AutomationRule;
  isRunning: boolean;
  onToggle: () => void;
  onRunNow: () => void;
  onDelete: () => void;
}

function RuleCard({ rule, isRunning, onToggle, onRunNow, onDelete }: RuleCardProps) {
  const successRate =
    rule.totalRuns > 0 ? Math.round((rule.successfulRuns / rule.totalRuns) * 100) : null;

  const scheduleLabel = () => {
    const s = rule.schedule;
    if (s.type === 'immediate') return 'Run Once';
    if (s.type === 'once') return `Once · ${dayjs(s.scheduledAt).format('MMM D, h:mm A')}`;
    const freq = FREQUENCIES.find((f) => f.id === s.frequency);
    return `${freq?.label ?? 'Recurring'} · ${s.timeOfDay ?? '09:00'}`;
  };

  return (
    <View style={[styles.ruleCard, rule.status === 'paused' && styles.ruleCardPaused]}>
      <View style={styles.ruleCardHeader}>
        <View style={styles.ruleCardLeft}>
          <Text style={styles.ruleName} numberOfLines={1}>
            {rule.name}
          </Text>
          <PlatformDots platforms={rule.platforms} />
        </View>
        <Switch
          value={rule.status === 'active'}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={COLORS.border}
        />
      </View>

      <View style={styles.ruleCardMeta}>
        <View style={styles.metaBadge}>
          <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{scheduleLabel()}</Text>
        </View>
        <View style={styles.metaBadge}>
          <Ionicons
            name={rule.autoPublish ? 'send-outline' : 'document-outline'}
            size={12}
            color={COLORS.textMuted}
          />
          <Text style={styles.metaText}>{rule.autoPublish ? 'Auto-publish' : 'Save as draft'}</Text>
        </View>
      </View>

      <View style={styles.ruleCardStats}>
        {rule.totalRuns > 0 ? (
          <>
            <Text style={styles.statText}>
              <Text style={styles.statValue}>{rule.totalRuns}</Text> runs
            </Text>
            <Text style={styles.statDivider}>·</Text>
            <Text style={styles.statText}>
              <Text style={[styles.statValue, { color: COLORS.accent }]}>{successRate}%</Text> success
            </Text>
          </>
        ) : (
          <Text style={styles.statText}>Never run</Text>
        )}
        {rule.lastRunAt && (
          <>
            <Text style={styles.statDivider}>·</Text>
            <Text style={styles.statText}>Last {dayjs(rule.lastRunAt).fromNow()}</Text>
          </>
        )}
      </View>

      <View style={styles.ruleCardActions}>
        <TouchableOpacity
          style={[styles.runBtn, (isRunning || rule.status === 'paused') && styles.runBtnDisabled]}
          onPress={onRunNow}
          disabled={isRunning || rule.status === 'paused'}
          activeOpacity={0.8}
        >
          {isRunning ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="play" size={14} color="#FFF" />
          )}
          <Text style={styles.runBtnText}>{isRunning ? 'Running...' : 'Run Now'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Run History Item ─────────────────────────────────────────────────────────

function RunHistoryItem({ run }: { run: AutomationRun }) {
  const isSuccess = run.status === 'completed';
  const successCount = run.results.filter((r) => r.success).length;

  return (
    <View style={styles.runItem}>
      <View style={[styles.runStatusDot, isSuccess ? styles.runDotSuccess : styles.runDotFailed]} />
      <View style={styles.runInfo}>
        <Text style={styles.runRuleName} numberOfLines={1}>
          {run.ruleName}
        </Text>
        <Text style={styles.runMeta}>
          {isSuccess
            ? `${successCount}/${run.platforms.length} platforms · ${run.generatedContent ? `Score: ${run.generatedContent.engagementScore}/10` : 'Draft saved'}`
            : run.error ?? 'Failed'}
        </Text>
      </View>
      <Text style={styles.runTime}>{dayjs(run.startedAt).fromNow()}</Text>
    </View>
  );
}

// ─── Create Rule Modal ────────────────────────────────────────────────────────

interface CreateRuleModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (params: CreateRuleParams) => void;
}

function CreateRuleModal({ visible, onClose, onCreate }: CreateRuleModalProps) {
  const [name, setName] = useState('');
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['instagram', 'facebook']);
  const [contentType, setContentType] = useState<ContentType>('text_post');
  const [hookType, setHookType] = useState<HookType>('bold_claim');
  const [framework, setFramework] = useState<ContentFramework>('AIDA');
  const [topic, setTopic] = useState('');
  const [autoPublish, setAutoPublish] = useState(false);
  const [scheduleType, setScheduleType] = useState<AutomationScheduleType>('recurring');
  const [frequency, setFrequency] = useState<AutomationFrequency>('daily');
  const [timeOfDay, setTimeOfDay] = useState('09:00');

  const reset = () => {
    setName('');
    setPlatforms(['instagram', 'facebook']);
    setContentType('text_post');
    setHookType('bold_claim');
    setFramework('AIDA');
    setTopic('');
    setAutoPublish(false);
    setScheduleType('recurring');
    setFrequency('daily');
    setTimeOfDay('09:00');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this automation.');
      return;
    }
    if (platforms.length === 0) {
      Alert.alert('No Platforms', 'Select at least one platform.');
      return;
    }

    onCreate({
      name: name.trim(),
      platforms,
      contentType,
      hookType,
      framework,
      topic: topic.trim() || undefined,
      autoPublish,
      schedule: {
        type: scheduleType,
        frequency: scheduleType === 'recurring' ? frequency : undefined,
        timeOfDay: scheduleType !== 'immediate' ? timeOfDay : undefined,
      },
    });

    reset();
    onClose();
  };

  const togglePlatform = (p: SocialPlatform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Automation</Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Rule Name *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Daily LinkedIn Post"
                placeholderTextColor={COLORS.textMuted}
                maxLength={60}
              />
            </View>

            {/* Platforms */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Platforms *</Text>
              <View style={styles.platformGrid}>
                {PLATFORMS.map((p) => {
                  const selected = platforms.includes(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.platformChip, selected && { borderColor: p.color, backgroundColor: `${p.color}20` }]}
                      onPress={() => togglePlatform(p.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={p.icon as keyof typeof Ionicons.glyphMap}
                        size={15}
                        color={selected ? p.color : COLORS.textMuted}
                      />
                      <Text style={[styles.platformChipText, selected && { color: p.color }]}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Content Type */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Content Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {CONTENT_TYPES.map((ct) => {
                  const sel = contentType === ct.id;
                  return (
                    <TouchableOpacity
                      key={ct.id}
                      style={[styles.typeChip, sel && styles.typeChipSelected]}
                      onPress={() => setContentType(ct.id as ContentType)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={ct.icon as keyof typeof Ionicons.glyphMap}
                        size={14}
                        color={sel ? COLORS.primary : COLORS.textMuted}
                      />
                      <Text style={[styles.typeChipText, sel && styles.typeChipTextSelected]}>
                        {ct.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Hook Type */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Hook Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {(Object.entries(HOOK_TYPE_DEFINITIONS) as [HookType, { label: string; engagementScore: number }][]).map(
                  ([id, def]) => {
                    const sel = hookType === id;
                    return (
                      <TouchableOpacity
                        key={id}
                        style={[styles.typeChip, sel && styles.typeChipSelected]}
                        onPress={() => setHookType(id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.typeChipText, sel && styles.typeChipTextSelected]}>
                          {def.label}
                        </Text>
                        <Text style={styles.hookScore}>⚡{def.engagementScore}</Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </ScrollView>
            </View>

            {/* Framework */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Framework</Text>
              <View style={styles.frameworkRow}>
                {FRAMEWORKS.map((fw) => {
                  const sel = framework === fw;
                  return (
                    <TouchableOpacity
                      key={fw}
                      style={[styles.fwPill, sel && styles.fwPillSelected]}
                      onPress={() => setFramework(fw)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.fwText, sel && styles.fwTextSelected]}>{fw}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Topic */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Topic (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={topic}
                onChangeText={setTopic}
                placeholder="Leave blank — AI will pick the best topic"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Schedule Type */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Schedule</Text>
              <View style={styles.scheduleTypeGrid}>
                {SCHEDULE_TYPES.map((st) => {
                  const sel = scheduleType === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[styles.scheduleTypeCard, sel && styles.scheduleTypeCardSelected]}
                      onPress={() => setScheduleType(st.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.scheduleTypeLabel, sel && styles.scheduleTypeLabelSelected]}>
                        {st.label}
                      </Text>
                      <Text style={styles.scheduleTypeDesc}>{st.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Frequency (recurring) */}
            {scheduleType === 'recurring' && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Frequency</Text>
                <View style={styles.freqRow}>
                  {FREQUENCIES.map((f) => {
                    const sel = frequency === f.id;
                    return (
                      <TouchableOpacity
                        key={f.id}
                        style={[styles.freqPill, sel && styles.freqPillSelected]}
                        onPress={() => setFrequency(f.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.freqText, sel && styles.freqTextSelected]}>
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Time of Day */}
            {scheduleType !== 'immediate' && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>
                  {scheduleType === 'recurring' ? 'Time of Day (HH:MM)' : 'Scheduled Time (HH:MM)'}
                </Text>
                <TextInput
                  style={[styles.textInput, styles.timeInput]}
                  value={timeOfDay}
                  onChangeText={setTimeOfDay}
                  placeholder="09:00"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            )}

            {/* Auto Publish Toggle */}
            <View style={styles.formSection}>
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.formLabel}>Auto-Publish</Text>
                  <Text style={styles.toggleDesc}>
                    {autoPublish
                      ? 'Posts go live immediately'
                      : 'Content saved as draft for review'}
                  </Text>
                </View>
                <Switch
                  value={autoPublish}
                  onValueChange={setAutoPublish}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={COLORS.border}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
              <Ionicons name="add-circle" size={18} color="#FFF" />
              <Text style={styles.createBtnText}>Create Rule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AutomateScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { profile } = useBusinessStore();
  const {
    rules,
    runs,
    isRunning,
    runningRuleId,
    progressPhase,
    error,
    createRule,
    deleteRule,
    toggleRule,
    runNow,
    clearError,
  } = useAutomation();

  const activeRules = rules.filter((r) => r.status === 'active').length;
  const totalRuns = rules.reduce((sum, r) => sum + r.totalRuns, 0);
  const totalSuccess = rules.reduce((sum, r) => sum + r.successfulRuns, 0);
  const overallSuccessRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : null;

  const handleDelete = useCallback(
    (ruleId: string, ruleName: string) => {
      Alert.alert(
        'Delete Automation',
        `Delete "${ruleName}"? All run history for this rule will also be removed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteRule(ruleId) },
        ],
      );
    },
    [deleteRule],
  );

  const recentRuns = runs.slice(0, 8);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Automations</Text>
          <Text style={styles.headerSubtitle}>
            {rules.length === 0
              ? 'No rules yet'
              : `${activeRules} active · ${rules.length} total`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && (
        <TouchableOpacity style={styles.errorBanner} onPress={clearError} activeOpacity={0.9}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorBannerText} numberOfLines={2}>{error}</Text>
          <Ionicons name="close" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}

      {/* Running Indicator */}
      {isRunning && (
        <View style={styles.runningBanner}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.runningText}>{progressPhase || 'Running automation...'}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rules.length === 0 ? (
          <EmptyState onCreate={() => setModalVisible(true)} />
        ) : (
          <>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>{rules.length}</Text>
                <Text style={styles.statCardLabel}>Rules</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>{totalRuns}</Text>
                <Text style={styles.statCardLabel}>Total Runs</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statCardValue, { color: COLORS.accent }]}>
                  {overallSuccessRate !== null ? `${overallSuccessRate}%` : '—'}
                </Text>
                <Text style={styles.statCardLabel}>Success Rate</Text>
              </View>
            </View>

            {/* Rules */}
            <Text style={styles.sectionTitle}>Your Rules</Text>
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                isRunning={isRunning && runningRuleId === rule.id}
                onToggle={() => toggleRule(rule.id)}
                onRunNow={() => runNow(rule.id)}
                onDelete={() => handleDelete(rule.id, rule.name)}
              />
            ))}

            {/* Run History */}
            {recentRuns.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Runs</Text>
                <View style={styles.historyCard}>
                  {recentRuns.map((run, i) => (
                    <React.Fragment key={run.id}>
                      <RunHistoryItem run={run} />
                      {i < recentRuns.length - 1 && <View style={styles.historyDivider} />}
                    </React.Fragment>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* API Key Hint */}
        {!profile && (
          <View style={styles.hintCard}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.warning} />
            <Text style={styles.hintText}>
              Complete onboarding and add your API keys in Settings before running automations.
            </Text>
          </View>
        )}
      </ScrollView>

      <CreateRuleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={createRule}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Banners
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '500',
  },
  runningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  runningText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyCreateBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statCardLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  // Rule Card
  ruleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  ruleCardPaused: { opacity: 0.65 },
  ruleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ruleCardLeft: { flex: 1, marginRight: 12 },
  ruleName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  platformDots: { flexDirection: 'row', gap: 4 },
  platformDot: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  ruleCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  statText: { fontSize: 12, color: COLORS.textMuted },
  statValue: { fontWeight: '700', color: COLORS.textPrimary },
  statDivider: { color: COLORS.border, fontSize: 12 },
  ruleCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  runBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  runBtnDisabled: { backgroundColor: COLORS.textMuted, opacity: 0.6 },
  runBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // History
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  runItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  runStatusDot: { width: 8, height: 8, borderRadius: 4 },
  runDotSuccess: { backgroundColor: COLORS.accent },
  runDotFailed: { backgroundColor: COLORS.error },
  runInfo: { flex: 1 },
  runRuleName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  runMeta: { fontSize: 12, color: COLORS.textMuted },
  runTime: { fontSize: 11, color: COLORS.textMuted },
  historyDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },

  // Hint card
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.warning,
    lineHeight: 20,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  modalCloseBtn: { padding: 4 },
  modalScroll: { flexShrink: 1 },
  modalScrollContent: { paddingHorizontal: 20, paddingBottom: 8 },

  // Form
  formSection: { marginTop: 20 },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  timeInput: { width: 100 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  platformChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  typeChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  typeChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  typeChipTextSelected: { color: COLORS.primary },
  hookScore: { fontSize: 10, color: COLORS.textMuted },
  frameworkRow: { flexDirection: 'row', gap: 8 },
  fwPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  fwPillSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fwText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  fwTextSelected: { color: '#FFF' },
  scheduleTypeGrid: { gap: 8 },
  scheduleTypeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
  },
  scheduleTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDim,
  },
  scheduleTypeLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  scheduleTypeLabelSelected: { color: COLORS.primary },
  scheduleTypeDesc: { fontSize: 12, color: COLORS.textMuted },
  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  freqPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  freqPillSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  freqText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  freqTextSelected: { color: '#FFF' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  toggleDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  // Modal footer
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  createBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  createBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
