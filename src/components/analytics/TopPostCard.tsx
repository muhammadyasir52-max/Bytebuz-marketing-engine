import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostAnalytics, SocialPlatform } from '@/types';
import PlatformIcon from '../common/PlatformIcon';
import Badge from '../common/Badge';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  accent: '#10B981',
  error: '#EF4444',
  primary: '#7C3AED',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function getEngagementRateBadgeVariant(
  rate: number
): 'success' | 'info' | 'warning' | 'muted' {
  if (rate >= 0.05) return 'success';
  if (rate >= 0.02) return 'info';
  if (rate >= 0.01) return 'warning';
  return 'muted';
}

function formatEngagementRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}% eng.`;
}

interface TopPostCardProps {
  analytics: PostAnalytics;
  platform: SocialPlatform;
  contentSnippet?: string;
  style?: ViewStyle;
}

interface MetricItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ icon, value, label, color }) => (
  <View style={metricStyles.item}>
    <Ionicons name={icon} size={14} color={color || COLORS.textMuted} />
    <Text style={[metricStyles.value, color ? { color } : {}]}>{value}</Text>
    <Text style={metricStyles.label}>{label}</Text>
  </View>
);

const metricStyles = StyleSheet.create({
  item: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});

const TopPostCard: React.FC<TopPostCardProps> = ({
  analytics,
  platform,
  contentSnippet,
  style,
}) => {
  const engagementBadgeVariant = getEngagementRateBadgeVariant(
    analytics.engagementRate
  );

  const postedDate = new Date(analytics.postedAt);
  const dateStr = postedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.header}>
        <PlatformIcon platform={platform} size="sm" />
        <View style={styles.headerMeta}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Badge
            label={formatEngagementRate(analytics.engagementRate)}
            variant={engagementBadgeVariant}
            size="sm"
          />
        </View>
      </View>

      {/* Content snippet */}
      {contentSnippet && (
        <Text style={styles.snippet} numberOfLines={2}>
          {contentSnippet}
        </Text>
      )}

      {/* Metrics grid */}
      <View style={styles.metricsGrid}>
        <MetricItem
          icon="heart"
          value={formatNumber(analytics.likes)}
          label="Likes"
          color="#E1306C"
        />
        <MetricItem
          icon="chatbubble"
          value={formatNumber(analytics.comments)}
          label="Comments"
          color="#3B82F6"
        />
        <MetricItem
          icon="arrow-redo"
          value={formatNumber(analytics.shares)}
          label="Shares"
          color="#10B981"
        />
        <MetricItem
          icon="eye"
          value={formatNumber(analytics.reach)}
          label="Reach"
          color={COLORS.textSecondary}
        />
      </View>

      {/* Video views if applicable */}
      {analytics.videoViews !== undefined && analytics.videoViews > 0 && (
        <View style={styles.videoViewsRow}>
          <Ionicons name="play-circle" size={13} color={COLORS.primary} />
          <Text style={styles.videoViewsText}>
            {formatNumber(analytics.videoViews)} views
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  headerMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  snippet: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    gap: 4,
  },
  videoViewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  videoViewsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default TopPostCard;
