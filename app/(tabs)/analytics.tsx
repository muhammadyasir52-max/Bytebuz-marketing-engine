import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAnalyticsStore, selectPlatformAnalytics } from '@/store/useAnalyticsStore';
import { AnalyticsPeriod, SocialPlatform, PlatformAnalytics } from '@/types';
import { PLATFORMS } from '@/constants/platforms';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import PlatformIcon from '@/components/common/PlatformIcon';

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
  secondary: '#3B82F6',
};

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatLastSynced(isoString: string | null): string {
  if (!isoString) return 'Never synced';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

interface OverallMetricProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function OverallMetric({ label, value, icon, color }: OverallMetricProps) {
  return (
    <View style={styles.overallMetric}>
      <View style={[styles.overallMetricIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.overallMetricValue}>{value}</Text>
      <Text style={styles.overallMetricLabel}>{label}</Text>
    </View>
  );
}

interface PlatformBreakdownCardProps {
  analytics: PlatformAnalytics;
}

function PlatformBreakdownCard({ analytics }: PlatformBreakdownCardProps) {
  const { platform, metrics } = analytics;
  return (
    <View style={styles.platformCard}>
      <View style={styles.platformCardHeader}>
        <PlatformIcon platform={platform} size="md" />
        <View style={styles.platformCardInfo}>
          <Text style={styles.platformCardName}>
            {PLATFORMS.find((p) => p.id === platform)?.name ?? platform}
          </Text>
          <View style={styles.followerRow}>
            <Text style={styles.followerCount}>{formatNumber(metrics.followers)}</Text>
            <Text style={styles.followerGrowth}>
              {metrics.followerGrowth >= 0 ? '+' : ''}
              {metrics.followerGrowth.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.platformMetrics}>
        <View style={styles.platformMetricItem}>
          <Text style={styles.platformMetricValue}>{formatNumber(metrics.reach)}</Text>
          <Text style={styles.platformMetricLabel}>Reach</Text>
        </View>
        <View style={styles.platformMetricDivider} />
        <View style={styles.platformMetricItem}>
          <Text style={styles.platformMetricValue}>{metrics.engagementRate.toFixed(2)}%</Text>
          <Text style={styles.platformMetricLabel}>Engagement</Text>
        </View>
        <View style={styles.platformMetricDivider} />
        <View style={styles.platformMetricItem}>
          <Text style={styles.platformMetricValue}>{formatNumber(metrics.impressions)}</Text>
          <Text style={styles.platformMetricLabel}>Impressions</Text>
        </View>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { analyticsCache, selectedPeriod, setSelectedPeriod, isLoading, lastSyncedAt, setLoading } =
    useAnalyticsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<SocialPlatform | 'all'>('all');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setRefreshing(false);
  }, [setLoading]);

  const cacheValues = Object.values(analyticsCache);
  const filteredAnalytics = selectedPlatformFilter === 'all'
    ? cacheValues.filter((a) => a.period === selectedPeriod)
    : cacheValues.filter(
        (a) => a.platform === selectedPlatformFilter && a.period === selectedPeriod,
      );

  const hasData = filteredAnalytics.length > 0;

  const totalReach = filteredAnalytics.reduce((sum, a) => sum + a.metrics.reach, 0);
  const avgEngagement =
    filteredAnalytics.length > 0
      ? filteredAnalytics.reduce((sum, a) => sum + a.metrics.engagementRate, 0) /
        filteredAnalytics.length
      : 0;
  const totalImpressions = filteredAnalytics.reduce((sum, a) => sum + a.metrics.impressions, 0);

  const topPosts = filteredAnalytics
    .flatMap((a) => a.topPosts ?? [])
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5);

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
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.lastSynced}>Synced {formatLastSynced(lastSyncedAt)}</Text>
        </View>

        {/* Period selector */}
        <View style={styles.periodSelector}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.periodPill, selectedPeriod === p.id && styles.periodPillActive]}
              onPress={() => setSelectedPeriod(p.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.periodText, selectedPeriod === p.id && styles.periodTextActive]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Platform filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.platformFilterRow}
          style={styles.platformFilter}
        >
          <TouchableOpacity
            style={[
              styles.platformFilterChip,
              selectedPlatformFilter === 'all' && styles.platformFilterChipActive,
            ]}
            onPress={() => setSelectedPlatformFilter('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.platformFilterText,
                selectedPlatformFilter === 'all' && styles.platformFilterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {PLATFORMS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.platformFilterChip,
                selectedPlatformFilter === p.id && styles.platformFilterChipActive,
              ]}
              onPress={() => setSelectedPlatformFilter(p.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={p.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={
                  selectedPlatformFilter === p.id ? COLORS.primary : COLORS.textMuted
                }
              />
              <Text
                style={[
                  styles.platformFilterText,
                  selectedPlatformFilter === p.id && styles.platformFilterTextActive,
                ]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <LoadingSpinner message="Loading analytics..." style={styles.loader} />
        ) : !hasData ? (
          <EmptyState
            icon="bar-chart-outline"
            title="No analytics data"
            subtitle="Connect your social accounts to see performance metrics"
            action={{
              label: 'Connect Accounts',
              onPress: () => router.push('/connectors'),
            }}
            style={styles.emptyState}
          />
        ) : (
          <>
            {/* Overall metrics */}
            <View style={styles.overallMetrics}>
              <OverallMetric
                label="Total Reach"
                value={formatNumber(totalReach)}
                icon="eye-outline"
                color={COLORS.secondary}
              />
              <OverallMetric
                label="Avg Engagement"
                value={`${avgEngagement.toFixed(2)}%`}
                icon="heart-outline"
                color={COLORS.accent}
              />
              <OverallMetric
                label="Impressions"
                value={formatNumber(totalImpressions)}
                icon="megaphone-outline"
                color={COLORS.primary}
              />
              <OverallMetric
                label="Platforms"
                value={String(filteredAnalytics.length)}
                icon="globe-outline"
                color="#F59E0B"
              />
            </View>

            {/* Platform breakdowns */}
            <Text style={styles.sectionTitle}>Platform Breakdown</Text>
            {filteredAnalytics.map((analytics) => (
              <PlatformBreakdownCard key={`${analytics.platform}-${analytics.period}`} analytics={analytics} />
            ))}

            {/* Top Posts */}
            {topPosts.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Top Posts</Text>
                {topPosts.map((post) => (
                  <View key={`${post.postId}-${post.platform}`} style={styles.topPostItem}>
                    <PlatformIcon platform={post.platform} size="sm" />
                    <View style={styles.topPostInfo}>
                      <View style={styles.topPostStats}>
                        <View style={styles.topPostStat}>
                          <Text style={styles.topPostStatValue}>{formatNumber(post.likes)}</Text>
                          <Text style={styles.topPostStatLabel}>Likes</Text>
                        </View>
                        <View style={styles.topPostStat}>
                          <Text style={styles.topPostStatValue}>{formatNumber(post.comments)}</Text>
                          <Text style={styles.topPostStatLabel}>Comments</Text>
                        </View>
                        <View style={styles.topPostStat}>
                          <Text style={styles.topPostStatValue}>{formatNumber(post.shares)}</Text>
                          <Text style={styles.topPostStatLabel}>Shares</Text>
                        </View>
                        <View style={styles.topPostStat}>
                          <Text style={[styles.topPostStatValue, { color: COLORS.accent }]}>
                            {post.engagementRate.toFixed(1)}%
                          </Text>
                          <Text style={styles.topPostStatLabel}>ER</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  lastSynced: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodPill: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  periodPillActive: { backgroundColor: COLORS.primary },
  periodText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  periodTextActive: { color: COLORS.textPrimary },
  platformFilter: { marginBottom: 20 },
  platformFilterRow: { gap: 8, paddingRight: 4 },
  platformFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 5,
  },
  platformFilterChipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.primary,
  },
  platformFilterText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  platformFilterTextActive: { color: COLORS.primary },
  loader: { marginTop: 60 },
  emptyState: { marginTop: 40 },
  overallMetrics: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  overallMetric: { flex: 1, alignItems: 'center', gap: 6 },
  overallMetricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallMetricValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  overallMetricLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  platformCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  platformCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  platformCardInfo: { flex: 1 },
  platformCardName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  followerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  followerCount: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  followerGrowth: { fontSize: 13, fontWeight: '600', color: COLORS.accent },
  platformMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
  },
  platformMetricItem: { flex: 1, alignItems: 'center' },
  platformMetricValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  platformMetricLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  platformMetricDivider: { width: 1, height: 32, backgroundColor: COLORS.border },
  topPostItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  topPostInfo: { flex: 1 },
  topPostStats: { flexDirection: 'row', justifyContent: 'space-around' },
  topPostStat: { alignItems: 'center' },
  topPostStatValue: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  topPostStatLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
});
