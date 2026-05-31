import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContentTypeConfig } from '@/constants/contentTypes';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  surface: '#141428',
};

interface ContentTypeCardProps {
  contentType: ContentTypeConfig;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const ContentTypeCard: React.FC<ContentTypeCardProps> = ({
  contentType,
  selected,
  onPress,
  style,
}) => {
  const cardBg = selected ? `${COLORS.primary}18` : COLORS.card;
  const cardBorder = selected ? COLORS.primary : COLORS.border;
  const iconBg = selected ? `${COLORS.primary}30` : `${COLORS.primary}14`;

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
      {/* Selection indicator */}
      {selected && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
        </View>
      )}

      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons
          name={contentType.icon as keyof typeof Ionicons.glyphMap}
          size={22}
          color={COLORS.primary}
        />
      </View>

      {/* Label */}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {contentType.label}
      </Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {contentType.description}
      </Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{contentType.estimatedProductionTime}</Text>
        </View>
        {contentType.requiresMedia && (
          <View style={styles.metaItem}>
            <Ionicons name="image-outline" size={11} color={COLORS.textMuted} />
            <Text style={styles.metaText}>Media needed</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    position: 'relative',
    flex: 1,
    minWidth: 140,
  },
  selectedBadge: {
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  labelSelected: {
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});

export default ContentTypeCard;
