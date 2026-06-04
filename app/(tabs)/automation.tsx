import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { usePostStore } from '@/store/usePostStore';
import { useAutomationStore } from '@/store/useAutomationStore';
import { useBusinessStore } from '@/store/useBusinessStore';
import { useAyrshare } from '@/hooks/useAyrshare';
import {
  Post,
  SocialPlatform,
  PostFrequency,
  AutomationRule,
  AutomationRuleType,
  BulkScheduleOptions,
} from '@/types';
import { PLATFORMS } from '@/constants/platforms';
import {
  generateBulkSchedule,
  getOptimalTimes,
  getFrequencyLabel,
  formatQueueTime,
  formatQueueDate,
  countBulkPosts,
} from '@/services/automation/automationService';
import PlatformIcon from '@/components/common/PlatformIcon';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  primaryLight: '#9D5FF5',
  secondary: '#3B82F6',
  accent: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  twitter: '#000000',
  tiktok: '#FF0050',
  youtube: '#FF0000',
};

type InnerTab = 'queue' | 'rules' | 'bulk';
type QueueFilter = 'all' | 'scheduled' | 'draft' | 'failed';

const FREQUENCIES: { value: PostFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: '3x_week', label: '3× / Week' },
  { value: '2x_week', label: '2× / Week' },
  { value: 'weekly', label: 'Weekly' },
];

const DURATION_OPTIONS: { days: number; label: string }[] = [
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
  { days: 60, label: '60 days' },
];

const RULE_PRESETS: { type: AutomationRuleType; icon: string; name: string; description: string }[] = [
  {
    type: 'optimal_timing',
    icon: 'time-outline',
    name: 'Optimal Timing',
    description: 'Schedule posts at peak engagement hours for each platform',
  },
  {
    type: 'recurring',
    icon: 'repeat-outline',
    name: 'Recurring Posts',
    description: 'Re-share your top performing content on a schedule',
  },
  {
    type: 'content_recycling',
    icon: 'refresh-outline',
    name: 'Content Recycling',
    description: 'Automatically recycle evergreen content to stay consistent',
  },
];

// ─── Helper: unique ID ────────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Helper: build draft Post ─────────────────────────────────────────────────

function buildDraftPost(platform: SocialPlatform, scheduledAt: string, businessId: string): Post {
  return {
    id: uid(),
    businessId,
    status: 'draft',
    platforms: [platform],
    contentType: 'text_post',
    content: {
      body: '',
      hashtags: [],
      hook: '',
      callToAction: '',
      seoKeywords: [],
    },
    media: [],
    schedule: {
      scheduledAt,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    metadata: {
      generatedByAI: false,
      hookType: 'how_to',
      framework: 'AIDA',
      wordCount: 0,
      estimatedReadTime: 0,
      claudeModel: '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Status badge helper ──────────────────────────────────────────────────────

function statusVariant(status: Post['status']): 'success' | 'warning' | 'error' | 'info' | 'muted' {
  switch (status) {
    case 'scheduled': return 'info';
    case 'posted': return 'success';
    case 'pending_review': return 'warning';
    case 'failed': return 'error';
    default: return 'muted';
  }
}

function statusLabel(status: Post['status']): string {
  switch (status) {
    case 'scheduled': return 'Scheduled';
    case 'posted': return 'Posted';
    case 'draft': return 'Draft';
    case 'pending_review': return 'Review';
    case 'failed': return 'Failed';
    default: return status;
  }
}

// ─── Rule type icon ───────────────────────────────────────────────────────────

function ruleIcon(type: AutomationRuleType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'optimal_timing': return 'time-outline';
    case 'recurring': return 'repeat-outline';
    case 'content_recycling': return 'refresh-outline';
    default: return 'settings-outline';
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PostQueueItemProps {
  post: Post;
  onPostNow: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isPosting: boolean;
}

function PostQueueItem({ post, onPostNow, onEdit, onDelete, isPosting }: PostQueueItemProps) {
  const dateStr = post.schedule?.scheduledAt ?? post.createdAt;
  const preview = (post.content.hook || post.content.body).slice(0, 72) || '(no content yet)';
  const date = formatQueueDate(dateStr);
  const time = post.schedule?.scheduledAt ? formatQueueTime(post.schedule.scheduledAt) : '--:--';

  return (
    <TouchableOpacity style={styles.queueItem} onPress={onEdit} activeOpacity={0.8}>
      <View style={styles.queueItemTime}>
        <Text style={styles.queueDate}>{date}</Text>
        <Text style={styles.queueTime}>{time}</Text>
      </View>
      <View style={styles.queueItemBody}>
        <View style={styles.queueItemHeader}>
          <View style={styles.platformIcons}>
            {post.platforms.slice(0, 3).map((p) => (
              <View key={p} style={styles.platformIconWrap}>
                <PlatformIcon platform={p} size="sm" />
              </View>
            ))}
          </View>
          <Badge label={statusLabel(post.status)} variant={statusVariant(post.status)} size="sm" />
        </View>
        <Text style={styles.queuePreview} numberOfLines={2}>
          {preview}
        </Text>
        <View style={styles.queueItemActions}>
          {post.status !== 'posted' && (
            <TouchableOpacity
              style={styles.queueActionBtn}
              onPress={onPostNow}
              disabled={isPosting}
              activeOpacity={0.7}
            >
              <Ionicons name="send-outline" size={14} color={COLORS.accent} />
              <Text style={[styles.queueActionText, { color: COLORS.accent }]}>Post Now</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.queueActionBtn}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color={COLORS.error} />
            <Text style={[styles.queueActionText, { color: COLORS.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

interface RuleCardProps {
  rule: AutomationRule;
  onToggle: () => void;
  onDelete: () => void;
}

function RuleCard({ rule, onToggle, onDelete }: RuleCardProps) {
  return (
    <View style={styles.ruleCard}>
      <View style={[styles.ruleIconBg, rule.isActive ? styles.ruleIconActive : styles.ruleIconInactive]}>
        <Ionicons name={ruleIcon(rule.type)} size={20} color={rule.isActive ? COLORS.primary : COLORS.textMuted} />
      </View>
      <View style={styles.ruleCardBody}>
        <Text style={styles.ruleName}>{rule.name}</Text>
        <Text style={styles.ruleDesc} numberOfLines={2}>{rule.description}</Text>
        <View style={styles.ruleMetaRow}>
          <View style={styles.ruleFreqBadge}>
            <Ionicons name="repeat-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.ruleFreqText}>{getFrequencyLabel(rule.frequency)}</Text>
          </View>
          <View style={styles.rulePlatforms}>
            {rule.platforms.slice(0, 3).map((p) => (
              <View key={p} style={styles.platformIconWrap}>
                <PlatformIcon platform={p} size="sm" />
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.ruleControls}>
        <Switch
          value={rule.isActive}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={COLORS.textPrimary}
          style={styles.ruleSwitch}
        />
        <TouchableOpacity onPress={onDelete} style={styles.ruleDeleteBtn} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Add Rule Modal ───────────────────────────────────────────────────────────

interface AddRuleModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (rule: AutomationRule) => void;
}

function AddRuleModal({ visible, onClose, onAdd }: AddRuleModalProps) {
  const [ruleName, setRuleName] = useState('');
  const [selectedType, setSelectedType] = useState<AutomationRuleType>('optimal_timing');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['instagram', 'facebook']);
  const [selectedFrequency, setSelectedFrequency] = useState<PostFrequency>('daily');

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const handleCreate = () => {
    if (!ruleName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this rule.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      Alert.alert('Platform Required', 'Select at least one platform.');
      return;
    }

    const preset = RULE_PRESETS.find((r) => r.type === selectedType);
    const now = new Date().toISOString();
    const rule: AutomationRule = {
      id: uid(),
      name: ruleName.trim(),
      type: selectedType,
      description: preset?.description ?? '',
      platforms: selectedPlatforms,
      frequency: selectedFrequency,
      postTimes: selectedPlatforms.flatMap((p) => getOptimalTimes(p).slice(0, 1)),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    onAdd(rule);
    setRuleName('');
    setSelectedType('optimal_timing');
    setSelectedPlatforms(['instagram', 'facebook']);
    setSelectedFrequency('daily');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Automation Rule</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            {/* Name */}
            <Text style={styles.modalLabel}>Rule Name</Text>
            <TextInput
              style={styles.modalInput}
              value={ruleName}
              onChangeText={setRuleName}
              placeholder="e.g. Morning Instagram Posts"
              placeholderTextColor={COLORS.textMuted}
              maxLength={60}
            />

            {/* Type */}
            <Text style={styles.modalLabel}>Rule Type</Text>
            {RULE_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.type}
                style={[styles.presetCard, selectedType === preset.type && styles.presetCardSelected]}
                onPress={() => setSelectedType(preset.type)}
                activeOpacity={0.8}
              >
                <View style={[styles.presetIconBg, selectedType === preset.type && styles.presetIconSelected]}>
                  <Ionicons
                    name={preset.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={selectedType === preset.type ? COLORS.primary : COLORS.textMuted}
                  />
                </View>
                <View style={styles.presetText}>
                  <Text style={[styles.presetName, selectedType === preset.type && { color: COLORS.primary }]}>
                    {preset.name}
                  </Text>
                  <Text style={styles.presetDesc} numberOfLines={2}>{preset.description}</Text>
                </View>
                {selectedType === preset.type && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}

            {/* Platforms */}
            <Text style={styles.modalLabel}>Platforms</Text>
            <View style={styles.platformGrid}>
              {PLATFORMS.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.platformChip, isSelected && { borderColor: p.color, backgroundColor: `${p.color}18` }]}
                    onPress={() => togglePlatform(p.id)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={p.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={isSelected ? p.color : COLORS.textMuted}
                    />
                    <Text style={[styles.platformChipText, isSelected && { color: p.color }]}>
                      {p.name.split(' ')[0]}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={12} color={p.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Frequency */}
            <Text style={styles.modalLabel}>Frequency</Text>
            <View style={styles.freqRow}>
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.freqChip, selectedFrequency === f.value && styles.freqChipSelected]}
                  onPress={() => setSelectedFrequency(f.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.freqChipText, selectedFrequency === f.value && styles.freqChipTextSelected]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose} activeOpacity={0.75}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCreateBtn} onPress={handleCreate} activeOpacity={0.85}>
              <Ionicons name="add-circle-outline" size={18} color={COLORS.textPrimary} />
              <Text style={styles.modalCreateText}>Create Rule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Queue Tab ────────────────────────────────────────────────────────────────

interface QueueTabProps {
  filter: QueueFilter;
  setFilter: (f: QueueFilter) => void;
}

function QueueTab({ filter, setFilter }: QueueTabProps) {
  const { drafts, scheduled, posted, deletePost } = usePostStore();
  const { postNow, isPosting } = useAyrshare();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const allPosts = [
    ...scheduled.sort((a, b) =>
      new Date(a.schedule?.scheduledAt ?? a.createdAt).getTime() -
      new Date(b.schedule?.scheduledAt ?? b.createdAt).getTime(),
    ),
    ...drafts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    ...posted.filter((p) => p.status === 'failed'),
  ];

  const filtered = allPosts.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'scheduled') return p.status === 'scheduled';
    if (filter === 'draft') return p.status === 'draft' || p.status === 'pending_review';
    if (filter === 'failed') return p.status === 'failed';
    return true;
  });

  const handleDelete = (post: Post) => {
    Alert.alert('Delete Post', 'Remove this post from the queue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePost(post.id) },
    ]);
  };

  const handlePostNow = (post: Post) => {
    Alert.alert('Post Now', `Publish this post to ${post.platforms.join(', ')} immediately?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Post Now',
        onPress: async () => {
          const result = await postNow(post);
          if (result) {
            Alert.alert('Published!', 'Your post has been sent to all selected platforms.');
          }
        },
      },
    ]);
  };

  const FILTERS: { key: QueueFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'draft', label: 'Drafts' },
    { key: 'failed', label: 'Failed' },
  ];

  return (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => {
          const count =
            f.key === 'all' ? allPosts.length
            : f.key === 'scheduled' ? scheduled.length
            : f.key === 'draft' ? drafts.length
            : posted.filter((p) => p.status === 'failed').length;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View style={[styles.filterBadge, filter === f.key && styles.filterBadgeActive]}>
                  <Text style={styles.filterBadgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Queue list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="layers-outline"
          title="Queue is empty"
          subtitle="Generate content or create drafts to fill your posting queue"
          action={{ label: 'Generate Content', onPress: () => router.push('/(tabs)/generate') }}
          style={styles.emptyState}
        />
      ) : (
        <View style={styles.queueList}>
          {filtered.map((post) => (
            <PostQueueItem
              key={post.id}
              post={post}
              isPosting={isPosting}
              onEdit={() => router.push(`/post/${post.id}` as any)}
              onPostNow={() => handlePostNow(post)}
              onDelete={() => handleDelete(post)}
            />
          ))}
        </View>
      )}

      {/* Calendar link */}
      <TouchableOpacity
        style={styles.calendarLink}
        onPress={() => router.push('/(tabs)/calendar' as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
        <Text style={styles.calendarLinkText}>View Full Calendar</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Rules Tab ────────────────────────────────────────────────────────────────

function RulesTab() {
  const { rules, addRule, toggleRule, deleteRule } = useAutomationStore();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Rule', `Remove the "${name}" automation rule?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRule(id) },
    ]);
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={18} color={COLORS.secondary} />
        <Text style={styles.infoBannerText}>
          Rules help you maintain a consistent posting schedule. Ayrshare handles auto-publishing for scheduled posts.
        </Text>
      </View>

      {/* Add rule button */}
      <TouchableOpacity style={styles.addRuleBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.addRuleBtnText}>Create Automation Rule</Text>
      </TouchableOpacity>

      {/* Rules list */}
      {rules.length === 0 ? (
        <EmptyState
          icon="git-branch-outline"
          title="No automation rules yet"
          subtitle="Create rules to automate your posting schedule and keep content flowing"
          style={styles.emptyState}
        />
      ) : (
        <View style={styles.rulesList}>
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={() => toggleRule(rule.id)}
              onDelete={() => handleDelete(rule.id, rule.name)}
            />
          ))}
        </View>
      )}

      {/* Preset tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsSectionTitle}>Platform Best Times</Text>
        {PLATFORMS.map((p) => (
          <View key={p.id} style={styles.tipRow}>
            <View style={styles.tipPlatformCol}>
              <View style={[styles.tipIconBg, { backgroundColor: `${PLATFORM_COLORS[p.id]}18` }]}>
                <Ionicons
                  name={p.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={PLATFORM_COLORS[p.id]}
                />
              </View>
              <Text style={styles.tipPlatformName}>{p.name.split(' ')[0]}</Text>
            </View>
            <View style={styles.tipTimes}>
              {p.bestPostTimes.map((t) => (
                <View key={t} style={styles.tipTimeBadge}>
                  <Text style={styles.tipTimeText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <AddRuleModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addRule}
      />
    </ScrollView>
  );
}

// ─── Bulk Schedule Tab ────────────────────────────────────────────────────────

function BulkScheduleTab() {
  const { addPost } = usePostStore();
  const { profile } = useBusinessStore();
  const businessId = profile?.id ?? 'default';

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['instagram', 'facebook']);
  const [durationDays, setDurationDays] = useState(14);
  const [frequency, setFrequency] = useState<PostFrequency>('3x_week');
  const [useOptimalTimes, setUseOptimalTimes] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const startDate = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const endDate = dayjs().add(durationDays, 'day').format('YYYY-MM-DD');

  const bulkOptions: BulkScheduleOptions = {
    platforms: selectedPlatforms,
    startDate,
    endDate,
    frequency,
    useOptimalTimes,
  };

  const estimatedCount = selectedPlatforms.length > 0 ? countBulkPosts(bulkOptions) : 0;

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) {
      Alert.alert('No Platforms', 'Select at least one platform to schedule posts for.');
      return;
    }

    Alert.alert(
      'Generate Schedule',
      `Create ${estimatedCount} draft post${estimatedCount !== 1 ? 's' : ''} across ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''} over the next ${durationDays} days?\n\nYou'll add content to each draft before publishing.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            setIsGenerating(true);
            const slots = generateBulkSchedule(bulkOptions);
            for (const slot of slots) {
              const post = buildDraftPost(slot.platform, slot.scheduledAt, businessId);
              addPost(post);
            }
            setIsGenerating(false);
            Alert.alert(
              'Schedule Created!',
              `${slots.length} draft posts have been added to your queue. Open each draft to add content, then schedule or post.`,
            );
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Section: Platforms */}
      <View style={styles.bulkSection}>
        <Text style={styles.bulkSectionTitle}>Select Platforms</Text>
        <Text style={styles.bulkSectionSubtitle}>Choose which channels to schedule posts for</Text>
        <View style={styles.platformGrid}>
          {PLATFORMS.map((p) => {
            const isSelected = selectedPlatforms.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.bulkPlatformCard, isSelected && { borderColor: p.color }]}
                onPress={() => togglePlatform(p.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.bulkPlatformIcon, { backgroundColor: `${p.color}20` }]}>
                  <Ionicons name={p.icon as keyof typeof Ionicons.glyphMap} size={22} color={p.color} />
                </View>
                <Text style={[styles.bulkPlatformName, isSelected && { color: p.color }]}>
                  {p.name.split(' ')[0]}
                </Text>
                {isSelected && (
                  <View style={[styles.bulkCheckmark, { backgroundColor: p.color }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section: Duration */}
      <View style={styles.bulkSection}>
        <Text style={styles.bulkSectionTitle}>Schedule Duration</Text>
        <Text style={styles.bulkSectionSubtitle}>
          Starting tomorrow: {dayjs(startDate).format('MMM D')} → {dayjs(endDate).format('MMM D, YYYY')}
        </Text>
        <View style={styles.durationRow}>
          {DURATION_OPTIONS.map((d) => (
            <TouchableOpacity
              key={d.days}
              style={[styles.durationChip, durationDays === d.days && styles.durationChipSelected]}
              onPress={() => setDurationDays(d.days)}
              activeOpacity={0.75}
            >
              <Text style={[styles.durationChipText, durationDays === d.days && styles.durationChipTextSelected]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section: Frequency */}
      <View style={styles.bulkSection}>
        <Text style={styles.bulkSectionTitle}>Posting Frequency</Text>
        <Text style={styles.bulkSectionSubtitle}>How often to post per platform</Text>
        <View style={styles.freqGrid}>
          {FREQUENCIES.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.freqCard, frequency === f.value && styles.freqCardSelected]}
              onPress={() => setFrequency(f.value)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="repeat-outline"
                size={18}
                color={frequency === f.value ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.freqCardText, frequency === f.value && styles.freqCardTextSelected]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section: Optimal Times */}
      <View style={styles.bulkSection}>
        <View style={styles.optimalTimesRow}>
          <View style={styles.optimalTimesLeft}>
            <Text style={styles.bulkSectionTitle}>Use Optimal Times</Text>
            <Text style={styles.bulkSectionSubtitle}>
              Auto-schedule at peak engagement hours per platform
            </Text>
          </View>
          <Switch
            value={useOptimalTimes}
            onValueChange={setUseOptimalTimes}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.textPrimary}
          />
        </View>
        {!useOptimalTimes && (
          <Text style={styles.customTimesNote}>Custom times can be set per platform in the Rules tab.</Text>
        )}
      </View>

      {/* Preview */}
      {estimatedCount > 0 && (
        <View style={styles.previewCard}>
          <View style={styles.previewRow}>
            <View style={styles.previewStat}>
              <Text style={styles.previewStatValue}>{estimatedCount}</Text>
              <Text style={styles.previewStatLabel}>Draft Posts</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewStat}>
              <Text style={styles.previewStatValue}>{selectedPlatforms.length}</Text>
              <Text style={styles.previewStatLabel}>Platforms</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewStat}>
              <Text style={styles.previewStatValue}>{durationDays}d</Text>
              <Text style={styles.previewStatLabel}>Duration</Text>
            </View>
          </View>
          <Text style={styles.previewNote}>
            Drafts will be added to your Queue. Open each one to write content, then publish or schedule.
          </Text>
        </View>
      )}

      {/* Generate button */}
      <TouchableOpacity
        style={[styles.generateBtn, (isGenerating || selectedPlatforms.length === 0) && styles.generateBtnDisabled]}
        onPress={handleGenerate}
        disabled={isGenerating || selectedPlatforms.length === 0}
        activeOpacity={0.85}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.textPrimary} />
        <Text style={styles.generateBtnText}>
          {isGenerating ? 'Generating…' : `Generate ${estimatedCount > 0 ? estimatedCount + ' ' : ''}Drafts`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AutomationScreen() {
  const [activeTab, setActiveTab] = useState<InnerTab>('queue');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const { isGlobalEnabled, setGlobalEnabled } = useAutomationStore();

  const INNER_TABS: { key: InnerTab; label: string; icon: string }[] = [
    { key: 'queue', label: 'Queue', icon: 'layers-outline' },
    { key: 'rules', label: 'Rules', icon: 'git-branch-outline' },
    { key: 'bulk', label: 'Bulk Schedule', icon: 'calendar-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Automation</Text>
          <Text style={styles.headerSubtitle}>Schedule & manage all platforms</Text>
        </View>
        <View style={styles.globalToggle}>
          <Text style={styles.globalToggleLabel}>{isGlobalEnabled ? 'Active' : 'Paused'}</Text>
          <Switch
            value={isGlobalEnabled}
            onValueChange={setGlobalEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
            thumbColor={COLORS.textPrimary}
          />
        </View>
      </View>

      {/* Inner tabs */}
      <View style={styles.innerTabBar}>
        {INNER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.innerTab, activeTab === tab.key && styles.innerTabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={tab.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={activeTab === tab.key ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.innerTabText, activeTab === tab.key && styles.innerTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === 'queue' && <QueueTab filter={queueFilter} setFilter={setQueueFilter} />}
      {activeTab === 'rules' && <RulesTab />}
      {activeTab === 'bulk' && <BulkScheduleTab />}

      {/* FAB: create new post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/generate')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  globalToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  globalToggleLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },

  // Inner tab bar
  innerTabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 4,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
  },
  innerTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  innerTabActive: { backgroundColor: COLORS.surface },
  innerTabText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  innerTabTextActive: { color: COLORS.primary },

  // Tab content area
  tabContent: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },

  // Queue tab
  filterRow: { gap: 8, paddingBottom: 12, paddingRight: 4 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: `${COLORS.primary}20`, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.primary },
  filterBadge: {
    backgroundColor: COLORS.border,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeActive: { backgroundColor: COLORS.primary },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.textPrimary },

  queueList: { gap: 10, paddingBottom: 120 },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  queueItemTime: { minWidth: 52, alignItems: 'center' },
  queueDate: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  queueTime: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  queueItemBody: { flex: 1 },
  queueItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  platformIcons: { flexDirection: 'row', gap: 4 },
  platformIconWrap: {},
  queuePreview: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 8 },
  queueItemActions: { flexDirection: 'row', gap: 12 },
  queueActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  queueActionText: { fontSize: 12, fontWeight: '600' },

  calendarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 40,
  },
  calendarLinkText: { flex: 1, fontSize: 14, color: COLORS.primary, fontWeight: '600' },

  emptyState: { minHeight: 200 },

  // Rules tab
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: `${COLORS.secondary}15`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}30`,
    padding: 14,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  infoBannerText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },

  addRuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
    paddingVertical: 14,
    marginBottom: 16,
  },
  addRuleBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },

  rulesList: { gap: 10, marginBottom: 24 },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  ruleIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  ruleIconActive: { backgroundColor: `${COLORS.primary}20` },
  ruleIconInactive: { backgroundColor: COLORS.surface },
  ruleCardBody: { flex: 1 },
  ruleName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  ruleDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 8 },
  ruleMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleFreqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ruleFreqText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  rulePlatforms: { flexDirection: 'row', gap: 3 },
  ruleControls: { alignItems: 'center', gap: 8 },
  ruleSwitch: {},
  ruleDeleteBtn: { padding: 4 },

  tipsSection: { marginBottom: 100 },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  tipPlatformCol: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 110 },
  tipIconBg: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tipPlatformName: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tipTimes: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tipTimeBadge: {
    backgroundColor: COLORS.card,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipTimeText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  // Bulk schedule tab
  bulkSection: { marginBottom: 24 },
  bulkSectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  bulkSectionSubtitle: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },

  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bulkPlatformCard: {
    width: '30.5%',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 6,
    position: 'relative',
  },
  bulkPlatformIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bulkPlatformName: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },
  bulkCheckmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  durationRow: { flexDirection: 'row', gap: 10 },
  durationChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  durationChipSelected: { backgroundColor: `${COLORS.primary}20`, borderColor: COLORS.primary },
  durationChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  durationChipTextSelected: { color: COLORS.primary },

  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  freqCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  freqCardSelected: { backgroundColor: `${COLORS.primary}15`, borderColor: COLORS.primary },
  freqCardText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  freqCardTextSelected: { color: COLORS.primary },

  optimalTimesRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optimalTimesLeft: { flex: 1 },
  customTimesNote: { fontSize: 12, color: COLORS.textMuted, marginTop: 8, fontStyle: 'italic' },

  previewCard: {
    backgroundColor: `${COLORS.accent}12`,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
    padding: 16,
    marginBottom: 20,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 12 },
  previewStat: { alignItems: 'center' },
  previewStatValue: { fontSize: 28, fontWeight: '800', color: COLORS.accent, letterSpacing: -0.5 },
  previewStatLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  previewDivider: { width: 1, height: 40, backgroundColor: `${COLORS.accent}30` },
  previewNote: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 17 },

  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 100,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  generateBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  generateBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 0.3 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '90%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  modalCloseBtn: { padding: 4 },
  modalContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 8,
  },
  presetCardSelected: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` },
  presetIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetIconSelected: { backgroundColor: `${COLORS.primary}20` },
  presetText: { flex: 1 },
  presetName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  presetDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16 },

  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  platformChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },

  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  freqChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  freqChipSelected: { backgroundColor: `${COLORS.primary}20`, borderColor: COLORS.primary },
  freqChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  freqChipTextSelected: { color: COLORS.primary },

  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  modalCreateBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  modalCreateText: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
