import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

const COLORS = {
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  accent: '#10B981',
  error: '#EF4444',
  secondary: '#3B82F6',
  border: '#2A2A45',
  surface: '#141428',
  textMuted: '#606080',
};

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'muted';
type BadgeSize = 'sm' | 'md';

const VARIANT_CONFIG: Record<
  BadgeVariant,
  { bg: string; text: string; border: string }
> = {
  success: {
    bg: 'rgba(16, 185, 129, 0.15)',
    text: '#10B981',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#F59E0B',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#EF4444',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.15)',
    text: '#3B82F6',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  primary: {
    bg: 'rgba(124, 58, 237, 0.15)',
    text: '#7C3AED',
    border: 'rgba(124, 58, 237, 0.3)',
  },
  muted: {
    bg: 'rgba(96, 96, 128, 0.15)',
    text: '#A0A0C0',
    border: 'rgba(96, 96, 128, 0.3)',
  },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  style,
}) => {
  const config = VARIANT_CONFIG[variant];

  const containerStyle: ViewStyle = {
    backgroundColor: config.bg,
    borderColor: config.border,
  };

  const textColor: TextStyle = {
    color: config.text,
  };

  return (
    <View
      style={[
        styles.badge,
        styles[`size_${size}`],
        containerStyle,
        style || {},
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          styles[`textSize_${size}`],
          textColor,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 100,
    borderWidth: 1,
  },
  size_sm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  size_md: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textSize_sm: {
    fontSize: 11,
  },
  textSize_md: {
    fontSize: 12,
  },
});

export default Badge;
