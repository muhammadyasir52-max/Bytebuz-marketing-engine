import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  Switch,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePostStore } from '@/store/usePostStore';
import { useAutomationStore } from '@/store/useAutomationStore';
import { useAutomation } from '@/hooks/useAutomation';
import QueueCard from '@/components/automation/QueueCard';
import AutomationRuleCard from '@/components/automation/AutomationRuleCard';
import OptimalTimesCard from '@/components/automation/OptimalTimesCard';
import { SocialPlatform, BulkScheduleConfig, DayOfWeek, AutomationRule } from '@/types';
import PlatformIcon from '@/components/common/PlatformIcon';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

const ALL_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'];
const ALL_DAYS: { label: string; value: DayOfWeek }[] = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const DEFAULT_TIMES = ['09:00', '12:00', '18:00'];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color }: {
  icon: string; value: number; label: string; color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionTitle({ title, action }: { title: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress} activeOpacity={0.75}>
          <Text style={styles.sectionAction}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type ActiveTab = 'queue' | 'rules' | 'timing';

export default function AutomationScreen() {
  const { drafts } = usePostStore();
  const { queue, rules, stats, clearCompleted, refreshStats } = useAutomationStore();
  const {
    isWorking,
    error,
    clearError,
    bulkSchedule,
    addToQueue,
    removeFromQueue,
    publishNow,
    processAll,
    createRule,
    toggleRule,
    deleteRule,
    previewRuleDates,
  } = useAutomation();

  const [activeTab, setActiveTab] = useState<ActiveTab>('queue');
  const [refreshing, setRefreshing] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Bulk schedule form state
  const [bulkPlatforms, setBulkPlatforms] = useState<SocialPlatform[]>(['instagram']);
  const [bulkDays, setBulkDays] = useState<DayOfWeek[]>([1, 3, 5]);
  const [bulkTimes, setBulkTimes] = useState<string[]>(['09:00', '18:00']);
  const [useOptimal, setUseOptimal] = useState(true);

  // New rule form state
  const [ruleName, setRuleName] = useState('');
  const [rulePlatforms, setRulePlatforms] = useState<SocialPlatform[]>(['instagram']);
  const [ruleDays, setRuleDays] = useState<DayOfWeek[]>([1, 3, 5]);
  const [ruleOptimal, setRuleOptimal] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshStats();
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  }, [refreshStats]);

  // Post store for looking up posts by id
  const getPost = usePostStore((s) => s.getPostById);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleBulkSchedule = async () => {
    const pendingDrafts = drafts.filter((d) => d.status === 'draft');
    if (pendingDrafts.length === 0) {
      Alert.alert('No Drafts', 'Create some draft posts first in the Generate tab.');
      return;
    }
    const config: BulkScheduleConfig = {
      platforms: bulkPlatforms,
      startDate: new Date().toISOString(),
      daysOfWeek: bulkDays,
      postTimes: bulkTimes,
      useOptimalTimes: useOptimal,
    };
    await bulkSchedule(pendingDrafts, config);
    setShowBulkModal(false);
    Alert.alert('Scheduled!', `${pendingDrafts.length} post(s) added to your queue.`);
  };

  const handleCreateRule = () => {
    if (!ruleName.trim()) {
      Alert.alert('Name Required', 'Give your automation rule a name.');
      return;
    }
    createRule(ruleName.trim(), {
      platforms: rulePlatforms,
      daysOfWeek: ruleDays,
      useOptimalTimes: ruleOptimal,
    });
    setRuleName('');
    setShowRuleModal(false);
  };

  const handleProcessAll = async () => {
    const pending = queue.filter((q) => q.status === 'pending');
    if (pending.length === 0) {
      Alert.alert('No Pending Posts', 'There are no pending posts in the queue.');
      return;
    }
    Alert.alert(
      'Publish All Pending',
      `Publish ${pending.length} pending post(s) now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish All',
          onPress: async () => {
            const { succeeded, failed } = await processAll();
            Alert.alert('Done', `${succeeded} published, ${failed} failed.`);
          },
        },
      ]
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    Alert.alert('Delete Rule', 'Remove this automation rule?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRule(ruleId) },
    ]);
  };

  const togglePlatform = (p: SocialPlatform, list: SocialPlatform[], setter: (v: SocialPlatform[]) => void) => {
    setter(list.includes(p) ? list.filter((x) => x !== p) : [...list, p]);
  };

  const toggleDay = (d: DayOfWeek, list: DayOfWeek[], setter: (v: DayOfWeek[]) => void) => {
    setter(list.includes(d) ? list.filter((x) => x !== d) : [...list, d]);
  };

  // ─── Render helpers ────────────────────────────────────────────────────

  const pendingQueue = queue.filter((q) => q.status !== 'done');
  const doneQueue = queue.filter((q) => q.status === 'done');

  const renderQueue = () => (
    <View style={styles.tabContent}>
      {/* Quick actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={() => setShowBulkModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={16} color={COLORS.textPrimary} />
          <Text style={styles.actionBtnText}>Bulk Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnOutline]}
          onPress={handleProcessAll}
          activeOpacity={0.8}
          disabled={isWorking}
        >
          {isWorking ? (
            <ActivityIndicator size={14} color={COLORS.primary} />
          ) : (
            <Ionicons name="send-outline" size={16} color={COLORS.primary} />
          )}
          <Text style={styles.actionBtnOutlineText}>Publish All</Text>
        </TouchableOpacity>
      </View>

      {/* Add drafts to queue */}
      {drafts.filter((d) => d.status === 'draft').length > 0 && (
        <View style={styles.draftBanner}>
          <Ionicons name="document-text-outline" size={16} color={COLORS.warning} />
          <Text style={styles.draftBannerText}>
            {drafts.filter((d) => d.status === 'draft').length} draft(s) not yet queued
          </Text>
          <TouchableOpacity
            onPress={() => {
              drafts.filter((d) => d.status === 'draft').forEach((p) => addToQueue(p));
              Alert.alert('Added', 'All drafts added to queue with current schedule.');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.draftBannerAction}>Add All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pending queue */}
      {pendingQueue.length > 0 ? (
        <>
          <Text style={styles.queueLabel}>Pending ({pendingQueue.length})</Text>
          {pendingQueue.map((item) => (
            <QueueCard
              key={item.id}
              item={item}
              post={getPost(item.postId)}
              onPublishNow={() => publishNow(item.id)}
              onRemove={() => removeFromQueue(item.id)}
            />
          ))}
        </>
      ) : (
        <View style={styles.emptyQueue}>
          <Ionicons name="list-outline" size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Queue is empty</Text>
          <Text style={styles.emptySubtitle}>Bulk schedule your drafts or add posts manually</Text>
        </View>
      )}

      {/* Done items */}
      {doneQueue.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.queueLabel}>Published ({doneQueue.length})</Text>
            <TouchableOpacity onPress={clearCompleted} activeOpacity={0.75}>
              <Text style={styles.sectionAction}>Clear</Text>
            </TouchableOpacity>
          </View>
          {doneQueue.slice(0, 5).map((item) => (
            <QueueCard
              key={item.id}
              item={item}
              post={getPost(item.postId)}
              onPublishNow={() => {}}
              onRemove={() => removeFromQueue(item.id)}
            />
          ))}
        </>
      )}
    </View>
  );

  const renderRules = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnPrimary, { alignSelf: 'flex-start' }]}
        onPress={() => setShowRuleModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={16} color={COLORS.textPrimary} />
        <Text style={styles.actionBtnText}>New Automation Rule</Text>
      </TouchableOpacity>

      {rules.length === 0 ? (
        <View style={styles.emptyQueue}>
          <Ionicons name="repeat-outline" size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No automation rules</Text>
          <Text style={styles.emptySubtitle}>Create rules to define recurring posting schedules</Text>
        </View>
      ) : (
        rules.map((rule) => (
          <AutomationRuleCard
            key={rule.id}
            rule={rule}
            nextDates={previewRuleDates(rule, 2)}
            onToggle={() => toggleRule(rule.id)}
            onDelete={() => handleDeleteRule(rule.id)}
          />
        ))
      )}
    </View>
  );

  const renderTiming = () => (
    <View style={styles.tabContent}>
      <OptimalTimesCard />
    </View>
  );

  // ─── Modals ────────────────────────────────────────────────────────────

  const renderBulkModal = () => (
    <Modal visible={showBulkModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowBulkModal(false)}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Bulk Schedule</Text>
          <TouchableOpacity onPress={() => setShowBulkModal(false)} activeOpacity={0.75}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.fieldLabel}>Target Platforms</Text>
          <View style={styles.chipRow}>
            {ALL_PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, bulkPlatforms.includes(p) && styles.chipActive]}
                onPress={() => togglePlatform(p, bulkPlatforms, setBulkPlatforms)}
                activeOpacity={0.75}
              >
                <PlatformIcon platform={p} size="sm" />
                <Text style={[styles.chipText, bulkPlatforms.includes(p) && styles.chipTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.optimalRow}>
            <View>
              <Text style={styles.fieldLabel}>Use Optimal Times</Text>
              <Text style={styles.fieldHint}>AI-suggested best posting windows</Text>
            </View>
            <Switch
              value={useOptimal}
              onValueChange={setUseOptimal}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.textPrimary}
            />
          </View>

          {!useOptimal && (
            <>
              <Text style={styles.fieldLabel}>Days of Week</Text>
              <View style={styles.chipRow}>
                {ALL_DAYS.map(({ label, value }) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.dayChip, bulkDays.includes(value) && styles.chipActive]}
                    onPress={() => toggleDay(value, bulkDays, setBulkDays)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, bulkDays.includes(value) && styles.chipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Post Times (HH:MM)</Text>
              <View style={styles.chipRow}>
                {DEFAULT_TIMES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, bulkTimes.includes(t) && styles.chipActive]}
                    onPress={() => setBulkTimes(bulkTimes.includes(t) ? bulkTimes.filter((x) => x !== t) : [...bulkTimes, t])}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, bulkTimes.includes(t) && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={styles.draftCount}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.draftCountText}>
              {drafts.filter((d) => d.status === 'draft').length} draft(s) will be scheduled
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleBulkSchedule} activeOpacity={0.85} disabled={isWorking}>
          {isWorking ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textPrimary} />
              <Text style={styles.modalSubmitText}>Schedule All Drafts</Text>
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );

  const renderRuleModal = () => (
    <Modal visible={showRuleModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowRuleModal(false)}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Automation Rule</Text>
          <TouchableOpacity onPress={() => setShowRuleModal(false)} activeOpacity={0.75}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.fieldLabel}>Rule Name</Text>
          <TextInput
            style={styles.textInput}
            value={ruleName}
            onChangeText={setRuleName}
            placeholder="e.g. Daily Instagram Posts"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
          />

          <Text style={styles.fieldLabel}>Platforms</Text>
          <View style={styles.chipRow}>
            {ALL_PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, rulePlatforms.includes(p) && styles.chipActive]}
                onPress={() => togglePlatform(p, rulePlatforms, setRulePlatforms)}
                activeOpacity={0.75}
              >
                <PlatformIcon platform={p} size="sm" />
                <Text style={[styles.chipText, rulePlatforms.includes(p) && styles.chipTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Days of Week</Text>
          <View style={styles.chipRow}>
            {ALL_DAYS.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[styles.dayChip, ruleDays.includes(value) && styles.chipActive]}
                onPress={() => toggleDay(value, ruleDays, setRuleDays)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, ruleDays.includes(value) && styles.chipTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.optimalRow}>
            <View>
              <Text style={styles.fieldLabel}>Use Optimal Times</Text>
              <Text style={styles.fieldHint}>Auto-select best engagement windows</Text>
            </View>
            <Switch
              value={ruleOptimal}
              onValueChange={setRuleOptimal}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.textPrimary}
            />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateRule} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.textPrimary} />
          <Text style={styles.modalSubmitText}>Create Rule</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );

  // ─── Main render ───────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Automation</Text>
            <Text style={styles.pageSubtitle}>Schedule and automate all your channels</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/(tabs)/generate')} activeOpacity={0.8}>
            <Ionicons name="add" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Error banner */}
        {error && (
          <TouchableOpacity style={styles.errorBanner} onPress={clearError} activeOpacity={0.8}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
            <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
            <Ionicons name="close" size={14} color={COLORS.error} />
          </TouchableOpacity>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard icon="time-outline" value={stats.scheduledCount} label="Scheduled" color={COLORS.warning} />
          <StatCard icon="checkmark-circle-outline" value={stats.postedThisWeek} label="This Week" color={COLORS.accent} />
          <StatCard icon="repeat-outline" value={stats.activeRules} label="Active Rules" color={COLORS.primary} />
          <StatCard icon="list-outline" value={stats.queueLength} label="In Queue" color={COLORS.textSecondary} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['queue', 'rules', 'timing'] as ActiveTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'queue' ? 'Post Queue' : tab === 'rules' ? 'Rules' : 'Best Times'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        {activeTab === 'queue' && renderQueue()}
        {activeTab === 'rules' && renderRules()}
        {activeTab === 'timing' && renderTiming()}
      </ScrollView>

      {renderBulkModal()}
      {renderRuleModal()}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Header
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${COLORS.error}22`,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 13, color: COLORS.error },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.textPrimary },

  // Tab content
  tabContent: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  sectionAction: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  queueLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionBtnPrimary: { backgroundColor: COLORS.primary },
  actionBtnOutline: { borderWidth: 1.5, borderColor: COLORS.primary },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  actionBtnOutlineText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Draft banner
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${COLORS.warning}18`,
    borderWidth: 1,
    borderColor: `${COLORS.warning}44`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  draftBannerText: { flex: 1, fontSize: 13, color: COLORS.warning },
  draftBannerAction: { fontSize: 13, fontWeight: '700', color: COLORS.warning },

  // Empty state
  emptyQueue: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', maxWidth: 260 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
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
  modalScroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10, marginTop: 16 },
  fieldHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  textInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.card,
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}22` },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primary },
  dayChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.card,
  },
  optimalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  draftCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  draftCountText: { fontSize: 13, color: COLORS.textSecondary },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    margin: 20,
    borderRadius: 14,
    paddingVertical: 16,
  },
  modalSubmitText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
});
