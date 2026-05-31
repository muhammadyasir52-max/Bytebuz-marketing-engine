import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Post, SocialPlatform } from '@/types';

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  twitter: '#FFFFFF',
  tiktok: '#FF0050',
  youtube: '#FF0000',
};

const COLORS = {
  textMuted: '#606080',
  primary: '#7C3AED',
};

const MAX_DOTS = 3;

interface PostDotRowProps {
  posts: Post[];
  style?: ViewStyle;
}

const PostDotRow: React.FC<PostDotRowProps> = ({ posts, style }) => {
  if (posts.length === 0) {
    return <View style={[styles.container, style]} />;
  }

  // Collect unique platforms from all posts (up to MAX_DOTS)
  const platformSet: SocialPlatform[] = [];
  for (const post of posts) {
    for (const platform of post.platforms) {
      if (!platformSet.includes(platform)) {
        platformSet.push(platform);
      }
      if (platformSet.length >= MAX_DOTS) break;
    }
    if (platformSet.length >= MAX_DOTS) break;
  }

  // Count total platforms beyond the visible dots
  const totalPlatforms = posts.reduce((count, p) => count + p.platforms.length, 0);
  const overflow = totalPlatforms > MAX_DOTS ? totalPlatforms - MAX_DOTS : 0;

  return (
    <View style={[styles.container, style]}>
      {platformSet.map((platform, i) => (
        <View
          key={`${platform}-${i}`}
          style={[
            styles.dot,
            { backgroundColor: PLATFORM_COLORS[platform] },
          ]}
        />
      ))}
      {overflow > 0 && (
        <Text style={styles.overflow}>+{overflow}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    minHeight: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  overflow: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});

export default PostDotRow;
