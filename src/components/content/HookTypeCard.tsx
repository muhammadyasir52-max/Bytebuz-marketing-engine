import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HookTypeDefinition } from '@/constants/hookTypes';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

function getEngagementColor(score: number): string {
  if (score >= 9) return '#10B981';
  if (score >= 7) return '#3B82F6';
  return '#F59E0B';
}

interface HookTypeCardProps {
  hookType: HookTypeDefinition;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const HookTypeCard: React.FC<HookTypeCardProps> = ({
  hookType,
  selected,
  onPress,
  style,
}) => {
  const engagementColor = getEngagementColor(hookType.engagementScore);
  const cardBg = selected ? `${COLORS.primary}18` : COLORS.card;
  const cardBorder = selected ? COLORS.primary : COLORS.border;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: cardBorder },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {hookType.label}
        </Text>
        {selected && (
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {hookType.description}
      </Text>

      {/* Formula chip */}
      <View style={styles.formulaRow}>
        <Ionicons name="flask-outline" size={11} color={COLORS.textMuted} />
        <Text style={styles.formulaText} numberOfLines={1}>
          {hookType.formula}
        </Text>
      </View>

      {/* Engagement score */}
      <View style={styles.bottomRow}>
        <View
          style={[
            styles.scorePill,
            { backgroundColor: `${engagementColor}18`, borderColor: `${engagementColor}40` },
          ]}
        >
          <Ionicons name="flame" size={10} color={engagementColor} />
          <Text style={[styles.scoreText, { color: engagementColor }]}>
            {hookType.engagementScore}/10
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    flex: 1,
  },
  labelSelected: {
    color: COLORS.textPrimary,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginBottom: 8,
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 10,
  },
  formulaText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default HookTypeCard;
