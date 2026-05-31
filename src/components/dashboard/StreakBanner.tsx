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
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  border: '#2A2A45',
};

function getStreakMessage(count: number): string {
  if (count === 0) return 'Start your posting streak today!';
  if (count === 1) return "You're on a roll! Keep it going.";
  if (count < 7) return `${count} days strong — don't break the chain!`;
  if (count < 14) return 'One week down! You\'re building momentum.';
  if (count < 30) return 'Incredible consistency! Your audience notices.';
  return `${count} days! You're a content machine. 🏆`;
}

interface StreakBannerProps {
  streakCount: number;
  onPress?: () => void;
  style?: ViewStyle;
}

const StreakBanner: React.FC<StreakBannerProps> = ({
  streakCount,
  onPress,
  style,
}) => {
  const message = getStreakMessage(streakCount);

  const content = (
    <View style={[styles.container, style]}>
      {/* Decorative glow blobs */}
      <View style={styles.glowLeft} />
      <View style={styles.glowRight} />

      <View style={styles.innerRow}>
        {/* Fire + count */}
        <View style={styles.streakGroup}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <View style={styles.countWrapper}>
            <Text style={styles.streakNumber}>{streakCount}</Text>
            <Text style={styles.streakUnit}>day{streakCount !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Message */}
        <View style={styles.messageWrapper}>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* Arrow if pressable */}
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color="rgba(255,255,255,0.5)"
            style={styles.arrow}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
    borderWidth: 1,
    borderColor: `${COLORS.primaryDark}80`,
  },
  glowLeft: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  glowRight: {
    position: 'absolute',
    bottom: -30,
    right: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fireEmoji: {
    fontSize: 28,
  },
  countWrapper: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 30,
    letterSpacing: -1,
  },
  streakUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 16,
  },
  messageWrapper: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  arrow: {
    marginLeft: 8,
  },
});

export default StreakBanner;
