import React from 'react';
import {
  View,
  Text,
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

interface MetricTileProps {
  label: string;
  value: string;
  change?: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  style?: ViewStyle;
}

const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  change,
  icon,
  color,
  style,
}) => {
  const hasChange = change !== undefined && change !== null;
  const isPositive = hasChange && change! > 0;
  const isNegative = hasChange && change! < 0;
  const changeColor = isPositive
    ? COLORS.accent
    : isNegative
    ? COLORS.error
    : COLORS.textMuted;
  const changeIcon: keyof typeof Ionicons.glyphMap = isPositive
    ? 'trending-up'
    : isNegative
    ? 'trending-down'
    : 'remove';

  return (
    <View style={[styles.tile, style]}>
      {/* Icon */}
      <View
        style={[
          styles.iconBox,
          { backgroundColor: `${color}1A`, borderColor: `${color}35` },
        ]}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>

      {/* Value */}
      <Text style={styles.value}>{value}</Text>

      {/* Label + change */}
      <View style={styles.bottomRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {hasChange && (
          <View style={styles.changePill}>
            <Ionicons name={changeIcon} size={10} color={changeColor} />
            <Text style={[styles.changeText, { color: changeColor }]}>
              {Math.abs(change!).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default MetricTile;
