import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeneratedVariant, SocialPlatform } from '@/types';
import Badge from '../common/Badge';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  secondary: '#3B82F6',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  surface: '#141428',
};

const PLATFORM_CHAR_LIMITS: Partial<Record<SocialPlatform, number>> = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
};

function getEngagementBadgeVariant(
  score: number
): 'success' | 'info' | 'warning' {
  if (score >= 0.75) return 'success';
  if (score >= 0.5) return 'info';
  return 'warning';
}

function formatEngagementScore(score: number): string {
  return `${Math.round(score * 100)}% match`;
}

interface GeneratedPostCardProps {
  variant: GeneratedVariant;
  platform: SocialPlatform;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  style?: ViewStyle;
}

const GeneratedPostCard: React.FC<GeneratedPostCardProps> = ({
  variant,
  platform,
  index,
  selected,
  onSelect,
  onEdit,
  style,
}) => {
  const [whyExpanded, setWhyExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const toggleWhy = () => {
    const toValue = whyExpanded ? 0 : 1;
    Animated.timing(expandAnim, {
      toValue,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setWhyExpanded(!whyExpanded);
  };

  const charLimit = PLATFORM_CHAR_LIMITS[platform];
  const totalChars = variant.hook.length + variant.body.length;
  const charOverLimit = charLimit ? totalChars > charLimit : false;

  const engagementBadgeVariant = getEngagementBadgeVariant(
    variant.estimatedEngagementScore
  );

  const cardBg = selected ? `${COLORS.primary}14` : COLORS.card;
  const cardBorder = selected ? COLORS.primary : COLORS.border;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }, style]}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index}</Text>
        </View>
        <View style={styles.headerMeta}>
          <Badge
            label={formatEngagementScore(variant.estimatedEngagementScore)}
            variant={engagementBadgeVariant}
            size="sm"
          />
          {charOverLimit && (
            <Badge label="Over limit" variant="error" size="sm" />
          )}
        </View>
      </View>

      {/* Hook */}
      <Text style={styles.hookText}>{variant.hook}</Text>

      {/* Body preview */}
      <Text style={styles.bodyPreview} numberOfLines={3}>
        {variant.body}
      </Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="pricetag-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.statText}>{variant.hashtags.length} tags</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="text-outline" size={12} color={COLORS.textMuted} />
          <Text
            style={[
              styles.statText,
              charOverLimit && { color: '#EF4444' },
            ]}
          >
            {totalChars}
            {charLimit ? `/${charLimit}` : ''} chars
          </Text>
        </View>
      </View>

      {/* Why it works expandable */}
      <TouchableOpacity
        style={styles.whyRow}
        onPress={toggleWhy}
        activeOpacity={0.8}
      >
        <Ionicons name="bulb-outline" size={14} color={COLORS.accent} />
        <Text style={styles.whyLabel}>Why it works</Text>
        <Ionicons
          name={whyExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={COLORS.textMuted}
          style={styles.whyChevron}
        />
      </TouchableOpacity>
      {whyExpanded && (
        <View style={styles.whyContent}>
          <Text style={styles.whyText}>{variant.whyItWorks}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.selectButton,
            selected && styles.selectButtonSelected,
          ]}
          onPress={onSelect}
          activeOpacity={0.8}
        >
          {selected && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
          <Text
            style={[
              styles.selectButtonText,
              selected && styles.selectButtonTextSelected,
            ]}
          >
            {selected ? 'Selected' : 'Select'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}30`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}60`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  hookText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 10,
  },
  bodyPreview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 6,
  },
  whyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    flex: 1,
  },
  whyChevron: {
    marginLeft: 'auto',
  },
  whyContent: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  whyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  selectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}22`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}50`,
  },
  selectButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  selectButtonTextSelected: {
    color: '#FFFFFF',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: `${COLORS.textSecondary}12`,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default GeneratedPostCard;
