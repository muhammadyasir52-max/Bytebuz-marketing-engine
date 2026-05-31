import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SocialPlatform } from '@/types';

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  instagram: {
    icon: 'logo-instagram',
    color: '#E1306C',
    label: 'Instagram',
  },
  facebook: {
    icon: 'logo-facebook',
    color: '#1877F2',
    label: 'Facebook',
  },
  linkedin: {
    icon: 'logo-linkedin',
    color: '#0A66C2',
    label: 'LinkedIn',
  },
  twitter: {
    icon: 'logo-twitter',
    color: '#FFFFFF',
    label: 'Twitter',
  },
  tiktok: {
    icon: 'logo-tiktok',
    color: '#FF0050',
    label: 'TikTok',
  },
  youtube: {
    icon: 'logo-youtube',
    color: '#FF0000',
    label: 'YouTube',
  },
};

const SIZE_CONFIG = {
  sm: { icon: 16, container: 28, borderRadius: 8, fontSize: 11 },
  md: { icon: 22, container: 40, borderRadius: 12, fontSize: 12 },
  lg: { icon: 30, container: 56, borderRadius: 16, fontSize: 14 },
};

type PlatformIconSize = 'sm' | 'md' | 'lg';

interface PlatformIconProps {
  platform: SocialPlatform;
  size?: PlatformIconSize;
  showLabel?: boolean;
  style?: ViewStyle;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  size = 'md',
  showLabel = false,
  style,
}) => {
  const config = PLATFORM_CONFIG[platform];
  const sizeConfig = SIZE_CONFIG[size];

  const bgColor = `${config.color}22`;
  const borderColor = `${config.color}44`;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.borderRadius,
            backgroundColor: bgColor,
            borderColor: borderColor,
          },
        ]}
      >
        <Ionicons
          name={config.icon}
          size={sizeConfig.icon}
          color={config.color}
        />
      </View>
      {showLabel && (
        <Text
          style={[
            styles.label,
            { fontSize: sizeConfig.fontSize, color: config.color },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  label: {
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export { PLATFORM_CONFIG };
export default PlatformIcon;
