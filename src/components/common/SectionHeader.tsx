import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';

const COLORS = {
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          activeOpacity={0.7}
          style={styles.actionButton}
        >
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  textGroup: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default SectionHeader;
