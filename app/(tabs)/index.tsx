import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessStore } from '@/store/useBusinessStore';
import { usePostStore } from '@/store/usePostStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { PLATFORMS } from '@/constants/platforms';
import { SocialPlatform } from '@/types';
import MetricCard from '@/components/dashboard/MetricCard';
import UpcomingPostCard from '@/components/dashboard/UpcomingPostCard';
import SectionHeader from '@/components/common/SectionHeader';
import EmptyState from '@/components/common/EmptyState';

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  secondary: '#3B82F6',
  accent: '#10B981',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function DashboardScreen() {
  const { profile } = useBusinessStore();
  const { drafts, scheduled, posted, getPostsByDate } = usePostStore();
  const { analyticsCache, isLoading, setLoading } = useAnalyticsStore();
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const todaysPosts = getPostsByDate(today);
  const allPosts = [...drafts, ...scheduled, ...posted];

  const postsThisWeek = allPosts.filter((p) => {
    const date = new Date(p.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length;

  const totalReach = Object.values(analyticsCache).reduce(
    (sum, analytics) => sum + (analytics.metrics?.reach ?? 0),
    0,
  );

  const avgEngagement = Object.values(analyticsCache).length > 0
    ? Object.values(analyticsCache).reduce(
        (sum, analytics) => sum + (analytics.metrics?.engagementRate ?? 0),
        0,
      ) / Object.values(analyticsCache).length
    : 0;

  const topPost = Object.values(analyticsCache)
    .flatMap((a) => a.topPosts ?? [])
    .sort((a, b) => b.engagementRate - a.engagementRate)[0] ?? null;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setRefreshing(false);
  }, [setLoading]);

  const businessName = profile?.businessName ?? 'there';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.businessName} numberOfLines={1}>
              {businessName}
            </Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{formatDate(today)}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
          style={styles.statsScroll}
        >
          <MetricCard
            title="Posts This Week"
            value={String(postsThisWeek)}
            icon="document-text-outline"
            color={COLORS.primary}
            style={styles.metricCard}
          />
          <MetricCard
            title="Total Reach (7d)"
            value={totalReach > 0 ? `${(totalReach / 1000).toFixed(1)}K` : '--'}
            icon="eye-outline"
            color={COLORS.secondary}
            style={styles.metricCard}
          />
          <MetricCard
            title="Avg Engagement"
            value={avgEngagement > 0 ? `${avgEngagement.toFixed(1)}%` : '--'}
            icon="heart-outline"
            color={COLORS.accent}
            style={styles.metricCard}
          />
          <MetricCard
            title="Drafts"
            value={String(drafts.length)}
            icon="pencil-outline"
            color="#F59E0B"
            style={styles.metricCard}
          />
        </ScrollView>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <SectionHeader
            title="Today's Schedule"
            action={{ label: 'View All', onPress: () => router.push('/(tabs)/calendar') }}
          />
          {todaysPosts.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="No posts scheduled today"
              subtitle="Generate your first post and schedule it"
              action={{
                label: 'Generate Content',
                onPress: () => router.push('/(tabs)/generate'),
              }}
              style={styles.emptyState}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.postsRow}
              style={styles.postsScroll}
            >
              {todaysPosts.map((post) => (
                <UpcomingPostCard
                  key={post.id}
                  post={post}
                  onPress={() => router.push(`/post/${post.id}` as any)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Top Performing Post */}
        <View style={styles.section}>
          <SectionHeader title="Top Performing Post" />
          {topPost ? (
            <TouchableOpacity
              style={styles.topPostCard}
              onPress={() => router.push('/(tabs)/analytics')}
              activeOpacity={0.8}
            >
              <View style={styles.topPostStats}>
                <View style={styles.topPostStat}>
                  <Text style={styles.topPostStatValue}>{topPost.likes}</Text>
                  <Text style={styles.topPostStatLabel}>Likes</Text>
                </View>
                <View style={styles.topPostStat}>
                  <Text style={styles.topPostStatValue}>{topPost.comments}</Text>
                  <Text style={styles.topPostStatLabel}>Comments</Text>
                </View>
                <View style={styles.topPostStat}>
                  <Text style={styles.topPostStatValue}>{topPost.shares}</Text>
                  <Text style={styles.topPostStatLabel}>Shares</Text>
                </View>
                <View style={styles.topPostStat}>
                  <Text style={[styles.topPostStatValue, { color: COLORS.accent }]}>
                    {topPost.engagementRate.toFixed(1)}%
                  </Text>
                  <Text style={styles.topPostStatLabel}>Engagement</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <EmptyState
              icon="bar-chart-outline"
              title="No analytics yet"
              subtitle="Connect your accounts to see performance data"
              action={{
                label: 'Connect Accounts',
                onPress: () => router.push('/connectors'),
              }}
              style={styles.emptyState}
            />
          )}
        </View>

        {/* AI Strategy Coach Card */}
        <TouchableOpacity
          style={styles.strategyCard}
          onPress={() => router.push('/strategy')}
          activeOpacity={0.85}
        >
          <View style={styles.strategyCardContent}>
            <View style={styles.strategyIconBg}>
              <Ionicons name="sparkles" size={22} color={COLORS.textPrimary} />
            </View>
            <View style={styles.strategyText}>
              <Text style={styles.strategyTitle}>Your Weekly Strategy</Text>
              <Text style={styles.strategySubtitle}>Fresh AI insights ready</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableOpacity>

        {/* Quick Generate Grid */}
        <View style={styles.section}>
          <SectionHeader title="Quick Generate" />
          <View style={styles.quickGenerateGrid}>
            {PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={styles.quickGenerateButton}
                onPress={() => router.push('/(tabs)/generate')}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.quickGenerateIcon,
                    { backgroundColor: `${platform.color}22` },
                  ]}
                >
                  <Ionicons
                    name={platform.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={platform.color}
                  />
                </View>
                <Text style={styles.quickGenerateLabel}>{platform.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
  businessName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  dateBadge: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 12,
    marginTop: 4,
  },
  dateText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  statsScroll: { marginBottom: 8 },
  statsRow: { gap: 12, paddingRight: 4, paddingBottom: 8 },
  metricCard: { width: 148 },
  section: { marginBottom: 28 },
  postsScroll: { marginTop: 12 },
  postsRow: { paddingRight: 4 },
  emptyState: { minHeight: 160 },
  topPostCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginTop: 12,
  },
  topPostStats: { flexDirection: 'row', justifyContent: 'space-around' },
  topPostStat: { alignItems: 'center' },
  topPostStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  topPostStatLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontWeight: '500' },
  strategyCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 28,
    backgroundColor: COLORS.primary,
  },
  strategyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  strategyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strategyText: { flex: 1 },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  strategySubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  quickGenerateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickGenerateButton: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    gap: 8,
  },
  quickGenerateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGenerateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
