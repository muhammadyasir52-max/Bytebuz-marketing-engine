import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlatformAnalytics, SocialPlatform } from '@/types';
import PlatformIcon from '../common/PlatformIcon';

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  twitter: '#FFFFFF',
  tiktok: '#FF0050',
  youtube: '#FF0000',
};

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  accent: '#10B981',
  error: '#EF4444',
};

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function formatEngagementRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

interface PlatformBreakdownProps {
  analytics: PlatformAnalytics[];
  onPlatformSelect: (platform: SocialPlatform) => void;
  style?: ViewStyle;
}

const PlatformBreakdown: React.FC<PlatformBreakdownProps> = ({
  analytics,
  onPlatformSelect,
  style,
}) => {
  if (analytics.length === 0) {
    return (
      <View style={[styles.empty, style]}>
        <Text style={styles.emptyText}>No platform data available.</Text>
      </View>
    );
  }

  // Find max engagement for bar scaling
  const maxEngagement = Math.max(
    ...analytics.map((a) => a.metrics.engagementRate)
  );

  return (
    <View style={[styles.container, style]}>
      {analytics.map((platformData) => {
        const color = PLATFORM_COLORS[platformData.platform];
        const engagementBarWidth =
          maxEngagement > 0
            ? `${(platformData.metrics.engagementRate / maxEngagement) * 100}%`
            : '0%';
        const followerGrowthPositive = platformData.metrics.followerGrowth >= 0;

        return (
          <TouchableOpacity
            key={platformData.platform}
            style={styles.row}
            onPress={() => onPlatformSelect(platformData.platform)}
            activeOpacity={0.8}
          >
            {/* Platform icon */}
            <PlatformIcon platform={platformData.platform} size="sm" />

            {/* Bar + stats */}
            <View style={styles.barSection}>
              <View style={styles.statsRow}>
                <Text style={styles.platformName}>
                  {platformData.platform.charAt(0).toUpperCase() +
                    platformData.platform.slice(1)}
                </Text>
                <View style={styles.rightStats}>
                  <Text style={styles.engagementRate}>
                    {formatEngagementRate(platformData.metrics.engagementRate)}
                  </Text>
                  <View style={styles.followerRow}>
                    <Ionicons
                      name={followerGrowthPositive ? 'arrow-up' : 'arrow-down'}
                      size={10}
                      color={followerGrowthPositive ? COLORS.accent : COLORS.error}
                    />
                    <Text style={styles.followers}>
                      {formatFollowers(platformData.metrics.followers)}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Engagement bar */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: engagementBarWidth as any,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
            </View>

            <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  barSection: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  platformName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  engagementRate: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  followerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  followers: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  barTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
});

export default PlatformBreakdown;
