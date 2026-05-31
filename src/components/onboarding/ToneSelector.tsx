import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandTone } from '@/types';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

interface ToneOption {
  id: BrandTone;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
}

const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Polished, credible and authoritative',
    icon: 'briefcase-outline',
    emoji: '💼',
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Friendly, relaxed and approachable',
    icon: 'chatbubbles-outline',
    emoji: '😊',
  },
  {
    id: 'witty',
    label: 'Witty',
    description: 'Clever, humorous and memorable',
    icon: 'sparkles-outline',
    emoji: '✨',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Confident, direct and unapologetic',
    icon: 'flash-outline',
    emoji: '⚡',
  },
  {
    id: 'empathetic',
    label: 'Empathetic',
    description: 'Warm, understanding and caring',
    icon: 'heart-outline',
    emoji: '❤️',
  },
  {
    id: 'authoritative',
    label: 'Authoritative',
    description: 'Expert, commanding and definitive',
    icon: 'shield-checkmark-outline',
    emoji: '🎯',
  },
  {
    id: 'inspirational',
    label: 'Inspirational',
    description: 'Motivating, uplifting and aspirational',
    icon: 'rocket-outline',
    emoji: '🚀',
  },
];

interface ToneSelectorProps {
  selected: BrandTone[];
  onSelect: (tone: BrandTone) => void;
  style?: ViewStyle;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({
  selected,
  onSelect,
  style,
}) => {
  return (
    <View style={[styles.grid, style]}>
      {TONE_OPTIONS.map((option) => {
        const isSelected = selected.includes(option.id);

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.card,
              isSelected && styles.cardSelected,
            ]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.8}
          >
            {/* Check indicator */}
            {isSelected && (
              <View style={styles.checkMark}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            )}

            {/* Emoji + icon */}
            <Text style={styles.emoji}>{option.emoji}</Text>

            {/* Label */}
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option.label}
            </Text>

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {option.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: `${COLORS.primary}18`,
    borderColor: COLORS.primary,
  },
  checkMark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  labelSelected: {
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
});

export default ToneSelector;
