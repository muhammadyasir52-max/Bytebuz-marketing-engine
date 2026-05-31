import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SocialPlatform } from '@/types';

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  instagram: { icon: 'logo-instagram', color: '#E1306C', label: 'Instagram' },
  facebook: { icon: 'logo-facebook', color: '#1877F2', label: 'Facebook' },
  linkedin: { icon: 'logo-linkedin', color: '#0A66C2', label: 'LinkedIn' },
  twitter: { icon: 'logo-twitter', color: '#FFFFFF', label: 'Twitter' },
  tiktok: { icon: 'logo-tiktok', color: '#FF0050', label: 'TikTok' },
  youtube: { icon: 'logo-youtube', color: '#FF0000', label: 'YouTube' },
};

const COLORS = {
  border: '#2A2A45',
  textSecondary: '#A0A0C0',
  surface: '#141428',
};

interface QuickGenerateButtonProps {
  platform: SocialPlatform;
  onPress: () => void;
  style?: ViewStyle;
}

const QuickGenerateButton: React.FC<QuickGenerateButtonProps> = ({
  platform,
  onPress,
  style,
}) => {
  const config = PLATFORM_CONFIG[platform];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 60,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 60,
      bounciness: 4,
    }).start();
  };

  const bgColor = `${config.color}18`;
  const borderColor = `${config.color}40`;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: bgColor,
              borderColor: borderColor,
            },
          ]}
        >
          <Ionicons name={config.icon} size={26} color={config.color} />
        </Animated.View>
        <Text style={styles.label} numberOfLines={1}>
          {config.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default QuickGenerateButton;
