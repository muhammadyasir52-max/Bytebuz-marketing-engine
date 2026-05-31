import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle } from 'react-native';

const COLORS = {
  border: '#2A2A45',
  primary: '#7C3AED',
  surface: '#141428',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  color?: string;
  style?: ViewStyle;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  color,
  style,
  height = 6,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const barColor = color || COLORS.primary;

  const clampedCurrent = Math.min(Math.max(current, 0), total);
  const percentage = total > 0 ? clampedCurrent / total : 0;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: percentage,
      useNativeDriver: false,
      tension: 60,
      friction: 8,
    }).start();
  }, [percentage]);

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            Step {clampedCurrent} of {total}
          </Text>
          <Text style={styles.percentage}>
            {Math.round(percentage * 100)}%
          </Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolated,
              backgroundColor: barColor,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    backgroundColor: COLORS.border,
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});

export default ProgressBar;
