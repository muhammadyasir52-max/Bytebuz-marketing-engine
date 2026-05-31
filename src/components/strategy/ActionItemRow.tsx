import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StrategyAction } from '@/types';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

const IMPACT_CONFIG: Record<
  StrategyAction['impact'],
  { label: string; color: string; bg: string }
> = {
  high: {
    label: 'High Impact',
    color: COLORS.accent,
    bg: `${COLORS.accent}18`,
  },
  medium: {
    label: 'Med Impact',
    color: COLORS.warning,
    bg: `${COLORS.warning}18`,
  },
  low: {
    label: 'Low Impact',
    color: COLORS.textSecondary,
    bg: 'rgba(160, 160, 192, 0.1)',
  },
};

interface ActionItemRowProps {
  action: StrategyAction;
  onToggle: (id: string) => void;
  style?: ViewStyle;
}

const ActionItemRow: React.FC<ActionItemRowProps> = ({
  action,
  onToggle,
  style,
}) => {
  const strikeAnim = useRef(
    new Animated.Value(action.completed ? 1 : 0)
  ).current;

  const handleToggle = () => {
    Animated.timing(strikeAnim, {
      toValue: action.completed ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    onToggle(action.id);
  };

  const impactConfig = IMPACT_CONFIG[action.impact];

  const textOpacity = strikeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.45],
  });

  return (
    <TouchableOpacity
      style={[styles.row, action.completed && styles.rowCompleted, style]}
      onPress={handleToggle}
      activeOpacity={0.8}
    >
      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          action.completed && styles.checkboxChecked,
        ]}
      >
        {action.completed && (
          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
        )}
      </View>

      {/* Text content */}
      <View style={styles.content}>
        <Animated.View style={{ opacity: textOpacity }}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                action.completed && styles.titleCompleted,
              ]}
              numberOfLines={2}
            >
              {action.title}
            </Text>
            {/* Strikethrough overlay */}
            {action.completed && (
              <View style={styles.strikethrough} />
            )}
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {action.description}
          </Text>
        </Animated.View>
      </View>

      {/* Impact badge */}
      <View
        style={[
          styles.impactBadge,
          { backgroundColor: impactConfig.bg },
        ]}
      >
        <Text style={[styles.impactText, { color: impactConfig.color }]}>
          {impactConfig.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  rowCompleted: {
    opacity: 0.75,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    position: 'relative',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  titleCompleted: {
    color: COLORS.textMuted,
  },
  strikethrough: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: COLORS.textMuted,
    transform: [{ translateY: -0.75 }],
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  impactBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

export default ActionItemRow;
