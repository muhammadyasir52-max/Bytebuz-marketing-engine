import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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

const ALL_PLATFORMS: SocialPlatform[] = [
  'instagram',
  'facebook',
  'linkedin',
  'twitter',
  'tiktok',
  'youtube',
];

const COLORS = {
  border: '#2A2A45',
  surface: '#141428',
  card: '#1C1C35',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

interface PlatformSelectorProps {
  selected: SocialPlatform[];
  onSelect: (platform: SocialPlatform) => void;
  multiSelect?: boolean;
  platforms?: SocialPlatform[];
  style?: ViewStyle;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selected,
  onSelect,
  multiSelect = true,
  platforms = ALL_PLATFORMS,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, style]}
    >
      {platforms.map((platform) => {
        const config = PLATFORM_CONFIG[platform];
        const isSelected = selected.includes(platform);

        const chipBg = isSelected ? `${config.color}22` : COLORS.card;
        const chipBorder = isSelected ? config.color : COLORS.border;

        return (
          <TouchableOpacity
            key={platform}
            style={[
              styles.chip,
              { backgroundColor: chipBg, borderColor: chipBorder },
            ]}
            onPress={() => onSelect(platform)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={config.icon}
              size={16}
              color={isSelected ? config.color : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.chipLabel,
                { color: isSelected ? config.color : COLORS.textSecondary },
              ]}
            >
              {config.label}
            </Text>
            {isSelected && (
              <View
                style={[
                  styles.selectedDot,
                  { backgroundColor: config.color },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
  },
});

export default PlatformSelector;
