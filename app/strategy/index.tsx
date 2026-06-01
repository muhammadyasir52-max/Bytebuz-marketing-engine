import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBusinessStore } from '@/store/useBusinessStore';
import { usePostStore } from '@/store/usePostStore';
import { WeeklyStrategy, ContentCalendarItem, StrategyAction, StrategyInsight } from '@/types';
import PlatformIcon from '@/components/common/PlatformIcon';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';

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
  warning: '#F59E0B',
  error: '#EF4444',
};

const STRATEGY_CACHE_KEY = 'weekly_strategy_cache';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function formatGeneratedAt(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

interface ContentCalendarItemRowProps {
  item: ContentCalendarItem;
  onAddToCalendar: () => void;
}

function ContentCalendarItemRow({ item, onAddToCalendar }: ContentCalendarItemRowProps) {
  return (
    <View style={styles.calendarItem}>
      <View style={styles.calendarItemLeft}>
        <View style={styles.dayChip}>
          <Text style={styles.dayChipText}>{item.day.slice(0, 3)}</Text>
        </View>
        <PlatformIcon platform={item.platform} size="sm" />
        <View style={styles.calendarItemInfo}>
          <Text style={styles.calendarItemType}>{item.contentType.replace(/_/g, ' ')}</Text>
          <Text style={styles.calendarItemTopic} numberOfLines={2}>
            {item.topic}
          </Text>
          <Text style={styles.calendarItemTime}>{item.suggestedTime}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addToCalendarButton}
        onPress={onAddToCalendar}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

interface ActionItemRowProps {
  item: StrategyAction;
  onToggle: () => void;
}

function ActionItemRow({ item, onToggle }: ActionItemRowProps) {
  const impactColor =
    item.impact === 'high' ? COLORS.accent : item.impact === 'medium' ? COLORS.warning : COLORS.textMuted;

  return (
    <TouchableOpacity style={styles.actionItem} onPress={onToggle} activeOpacity={0.7}>
      <TouchableOpacity onPress={onToggle} style={styles.actionCheckbox} activeOpacity={0.7}>
        <Ionicons
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={item.completed ? COLORS.accent : COLORS.border}
        />
      </TouchableOpacity>
      <View style={styles.actionItemContent}>
        <View style={styles.actionItemHeader}>
          <Text style={[styles.actionTitle, item.completed && styles.actionTitleCompleted]}>
            {item.title}
          </Text>
          <View style={[styles.impactBadge, { backgroundColor: `${impactColor}22` }]}>
            <Text style={[styles.impactText, { color: impactColor }]}>{item.impact}</Text>
          </View>
        </View>
        <Text style={styles.actionDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface InsightCardProps {
  insight: StrategyInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightIconBg}>
        <Ionicons name="bulb-outline" size={18} color={COLORS.warning} />
      </View>
      <View style={styles.insightContent}>
        <Text style={styles.insightText}>{insight.insight}</Text>
        <Text style={styles.insightRecommendation}>{insight.recommendation}</Text>
      </View>
    </View>
  );
}

export default function StrategyScreen() {
  const { profile } = useBusinessStore();
  const { addPost, drafts } = usePostStore();
  const [strategy, setStrategy] = useState<WeeklyStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionItems, setActionItems] = useState<StrategyAction[]>([]);

  useEffect(() => {
    loadCachedStrategy();
  }, []);

  const loadCachedStrategy = async () => {
    setIsLoading(true);
    try {
      const cached = await AsyncStorage.getItem(STRATEGY_CACHE_KEY);
      if (cached) {
        const parsed: WeeklyStrategy = JSON.parse(cached);
        const generatedAt = new Date(parsed.generatedAt).getTime();
        if (Date.now() - generatedAt < CACHE_TTL_MS) {
          setStrategy(parsed);
          setActionItems(parsed.actionItems);
        }
      }
    } catch {
      // cache miss is fine
    } finally {
      setIsLoading(false);
    }
  };

  const generateStrategy = async (forceRegenerate = false) => {
    if (strategy && !forceRegenerate) {
      const generatedAt = new Date(strategy.generatedAt).getTime();
      const daysSince = Math.floor((Date.now() - generatedAt) / (1000 * 60 * 60 * 24));
      if (daysSince < 7) {
        Alert.alert(
          'Strategy is Recent',
          `Your strategy was generated ${formatGeneratedAt(strategy.generatedAt)}. Regenerate anyway?`,
          [
            { text: 'Keep Current', style: 'cancel' },
            { text: 'Regenerate', onPress: () => generateStrategy(true) },
          ],
        );
        return;
      }
    }

    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));

    const mockStrategy: WeeklyStrategy = {
      focusTheme: 'Authority & Trust Building',
      calendarItems: [
        {
          day: 'Monday',
          platform: 'linkedin',
          contentType: 'text_post',
          topic: 'The biggest mistake in your niche — and how we fixed it',
          suggestedTime: '8:00 AM',
        },
        {
          day: 'Tuesday',
          platform: 'instagram',
          contentType: 'carousel',
          topic: '5 frameworks our top clients use to grow 3x faster',
          suggestedTime: '12:00 PM',
        },
        {
          day: 'Wednesday',
          platform: 'twitter',
          contentType: 'thread',
          topic: 'Controversial opinion: Most businesses focus on the wrong KPIs',
          suggestedTime: '8:00 AM',
        },
        {
          day: 'Thursday',
          platform: 'linkedin',
          contentType: 'image_post',
          topic: 'Client transformation story: From $0 to $50K in 90 days',
          suggestedTime: '10:00 AM',
        },
        {
          day: 'Friday',
          platform: 'instagram',
          contentType: 'reel_script',
          topic: 'A day in the life — what growing a ${profile?.niche ?? "business"} actually looks like',
          suggestedTime: '5:00 PM',
        },
        {
          day: 'Saturday',
          platform: 'facebook',
          contentType: 'text_post',
          topic: 'The one question I wish someone asked me earlier in my journey',
          suggestedTime: '9:00 AM',
        },
        {
          day: 'Sunday',
          platform: 'instagram',
          contentType: 'story',
          topic: 'Behind the scenes: weekend prep and upcoming week teaser',
          suggestedTime: '6:00 PM',
        },
      ],
      insights: [
        {
          id: '1',
          insight: 'Your audience is most active on weekday mornings between 8–10 AM',
          recommendation: 'Schedule your highest-value content for Monday and Thursday 8 AM slots',
        },
        {
          id: '2',
          insight: 'Carousel posts are generating 3x more saves than single-image posts',
          recommendation: 'Prioritise educational carousels for your Instagram content this week',
        },
        {
          id: '3',
          insight: 'Competitor @example is gaining traction with behind-the-scenes content',
          recommendation: 'Add authentic BTS content to Friday\'s Reel to compete for the same audience',
        },
      ],
      actionItems: [
        {
          id: '1',
          title: 'Record Friday Reel this week',
          description: 'Film 30-60 second authentic behind-the-scenes video before Friday',
          impact: 'high',
          completed: false,
        },
        {
          id: '2',
          title: 'Gather 2 client testimonials',
          description: 'Reach out to your top 2 clients for a quick 2-sentence win to share',
          impact: 'high',
          completed: false,
        },
        {
          id: '3',
          title: 'Create LinkedIn carousel template',
          description: 'Design a reusable 5-slide carousel template you can batch in 20 minutes',
          impact: 'medium',
          completed: false,
        },
        {
          id: '4',
          title: 'Set up posting reminders',
          description: 'Enable notifications in Settings to get reminders 1 hour before each post',
          impact: 'low',
          completed: false,
        },
      ],
      boldMove: 'Go live on LinkedIn this week for 15 minutes. Share your unfiltered take on the #1 thing wrong with your industry. No slides, no script — just your authentic expertise. Live content gets 6x more reach than pre-recorded posts.',
      generatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem(STRATEGY_CACHE_KEY, JSON.stringify(mockStrategy));
    } catch {
      // non-fatal
    }

    setStrategy(mockStrategy);
    setActionItems(mockStrategy.actionItems);
    setIsGenerating(false);
  };

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const addItemToCalendar = (item: ContentCalendarItem) => {
    const post = {
      id: Math.random().toString(36).slice(2),
      businessId: profile?.id ?? 'local',
      status: 'draft' as const,
      platforms: [item.platform],
      contentType: item.contentType,
      content: {
        hook: '',
        body: item.topic,
        hashtags: [],
        callToAction: '',
        seoKeywords: [],
      },
      media: [],
      metadata: {
        generatedByAI: true,
        hookType: 'relatable_story' as const,
        framework: 'AIDA' as const,
        wordCount: 0,
        estimatedReadTime: 0,
        claudeModel: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addPost(post);
    Alert.alert('Added', `${item.platform} post for ${item.day} added to your drafts.`);
  };

  const addAllToCalendar = () => {
    if (!strategy) return;
    Alert.alert(
      'Add All to Calendar',
      `This will create ${strategy.calendarItems.length} draft posts in your calendar. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add All',
          onPress: () => {
            strategy.calendarItems.forEach((item) => addItemToCalendar(item));
            Alert.alert('Done', `${strategy.calendarItems.length} posts added to your drafts.`);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Strategy Coach</Text>
          <View style={styles.claudeBadge}>
            <Ionicons name="sparkles" size={12} color={COLORS.primary} />
            <Text style={styles.claudeBadgeText}>Powered by Claude</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner message="Loading your strategy..." fullScreen />
      ) : isGenerating ? (
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.generatingTitle}>Crafting your strategy...</Text>
          <Text style={styles.generatingSubtitle}>
            Claude is analysing your business and market to build a winning weekly plan
          </Text>
        </View>
      ) : !strategy ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="trophy-outline"
            title="Generate Your Weekly Strategy"
            subtitle="Claude will analyse your business, audience, and market to create a personalised 7-day content plan with insights and action items."
            action={{
              label: 'Generate Strategy',
              onPress: () => generateStrategy(),
            }}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Generated timestamp */}
          <Text style={styles.generatedAt}>
            Last generated: {formatGeneratedAt(strategy.generatedAt)}
          </Text>

          {/* Focus Theme */}
          <View style={styles.focusCard}>
            <Text style={styles.focusCardLabel}>This Week's Focus</Text>
            <Text style={styles.focusTheme}>{strategy.focusTheme}</Text>
            <Text style={styles.focusSubtitle}>
              All your content this week should reinforce this central theme
            </Text>
          </View>

          {/* Content Calendar */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Content Calendar</Text>
              <TouchableOpacity onPress={addAllToCalendar} activeOpacity={0.7}>
                <Text style={styles.addAllText}>Add All</Text>
              </TouchableOpacity>
            </View>
            {strategy.calendarItems.map((item, index) => (
              <ContentCalendarItemRow
                key={index}
                item={item}
                onAddToCalendar={() => addItemToCalendar(item)}
              />
            ))}
          </View>

          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            {strategy.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </View>

          {/* Action Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Action Items</Text>
            {actionItems.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleActionItem(item.id)}
              />
            ))}
          </View>

          {/* Bold Move */}
          <View style={styles.boldMoveCard}>
            <View style={styles.boldMoveHeader}>
              <Ionicons name="flash" size={20} color={COLORS.warning} />
              <Text style={styles.boldMoveTitle}>Bold Move of the Week</Text>
            </View>
            <Text style={styles.boldMoveText}>{strategy.boldMove}</Text>
          </View>

          {/* Apply All to Calendar */}
          <Button
            label="Apply All to Calendar"
            onPress={addAllToCalendar}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.applyButton}
          />

          {/* Regenerate */}
          <Button
            label="Regenerate Strategy"
            onPress={() => generateStrategy(false)}
            variant="ghost"
            size="md"
            fullWidth
            style={styles.regenerateButton}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { paddingTop: 2 },
  headerTextGroup: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  claudeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  claudeBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  generatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  generatingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    textAlign: 'center',
  },
  generatingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  emptyContainer: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  generatedAt: {
    fontSize: 13,
    color: COLORS.textMuted,
    paddingTop: 14,
    paddingBottom: 6,
    fontStyle: 'italic',
  },
  focusCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    marginTop: 4,
  },
  focusCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  focusTheme: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  focusSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20 },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addAllText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  calendarItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dayChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 36,
    alignItems: 'center',
  },
  dayChipText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  calendarItemInfo: { flex: 1 },
  calendarItemType: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'capitalize',
    marginBottom: 3,
  },
  calendarItemTopic: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 18, marginBottom: 4 },
  calendarItemTime: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  addToCalendarButton: { padding: 4 },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  insightIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: { flex: 1 },
  insightText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 6,
  },
  insightRecommendation: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  actionCheckbox: { marginTop: 1 },
  actionItemContent: { flex: 1 },
  actionItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  actionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  actionTitleCompleted: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  impactText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  actionDescription: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  boldMoveCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: 18,
    marginBottom: 24,
  },
  boldMoveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  boldMoveTitle: { fontSize: 16, fontWeight: '800', color: COLORS.warning },
  boldMoveText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  applyButton: { marginBottom: 12 },
  regenerateButton: { marginBottom: 8 },
  bottomPadding: { height: 20 },
});
