import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StrategyInsight } from '@/types';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  secondary: '#3B82F6',
  accent: '#10B981',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

type InsightIconConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const ICON_CONFIGS: InsightIconConfig[] = [
  { icon: 'bulb-outline', color: '#F59E0B' },
  { icon: 'bar-chart-outline', color: COLORS.secondary },
  { icon: 'flag-outline', color: COLORS.primary },
  { icon: 'trending-up-outline', color: COLORS.accent },
  { icon: 'star-outline', color: '#F59E0B' },
  { icon: 'rocket-outline', color: COLORS.primary },
  { icon: 'diamond-outline', color: '#E1306C' },
];

interface WeeklyInsightCardProps {
  insight: StrategyInsight;
  index: number;
  style?: ViewStyle;
}

const WeeklyInsightCard: React.FC<WeeklyInsightCardProps> = ({
  insight,
  index,
  style,
}) => {
  const iconConfig = ICON_CONFIGS[index % ICON_CONFIGS.length];

  return (
    <View style={[styles.card, style]}>
      {/* Icon header */}
      <View style={styles.iconRow}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: `${iconConfig.color}18`,
              borderColor: `${iconConfig.color}35`,
            },
          ]}
        >
          <Ionicons name={iconConfig.icon} size={20} color={iconConfig.color} />
        </View>
        <View
          style={[
            styles.indexBadge,
            { backgroundColor: `${iconConfig.color}15` },
          ]}
        >
          <Text style={[styles.indexText, { color: iconConfig.color }]}>
            #{index + 1}
          </Text>
        </View>
      </View>

      {/* Insight text */}
      <Text style={styles.insightText}>{insight.insight}</Text>

      {/* Recommendation block */}
      <View style={styles.recommendationBlock}>
        <View style={styles.recommendationHeader}>
          <Ionicons name="arrow-forward-circle" size={14} color={iconConfig.color} />
          <Text style={[styles.recommendationLabel, { color: iconConfig.color }]}>
            Recommendation
          </Text>
        </View>
        <Text style={styles.recommendationText}>{insight.recommendation}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  indexBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  indexText: {
    fontSize: 12,
    fontWeight: '700',
  },
  insightText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 14,
  },
  recommendationBlock: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
});

export default WeeklyInsightCard;
