import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  accent: '#10B981',
  error: '#EF4444',
};

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  onPress,
  style,
}) => {
  const hasChange = change !== undefined && change !== null;
  const isPositive = hasChange && change! > 0;
  const isNegative = hasChange && change! < 0;
  const changeColor = isPositive ? COLORS.accent : isNegative ? COLORS.error : COLORS.textMuted;
  const changeIcon: keyof typeof Ionicons.glyphMap = isPositive
    ? 'arrow-up'
    : isNegative
    ? 'arrow-down'
    : 'remove';

  const iconBg = `${color}22`;
  const iconBorder = `${color}44`;

  const content = (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconBg, borderColor: iconBorder },
          ]}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {hasChange && (
          <View style={[styles.changePill, { backgroundColor: `${changeColor}18` }]}>
            <Ionicons name={changeIcon} size={10} color={changeColor} />
            <Text style={[styles.changeText, { color: changeColor }]}>
              {Math.abs(change!).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default MetricCard;
