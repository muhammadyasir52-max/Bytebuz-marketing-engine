import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostContent, SocialPlatform } from '@/types';

const PLATFORM_CHAR_LIMITS: Partial<Record<SocialPlatform, number>> = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
};

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  primary: '#7C3AED',
  accent: '#10B981',
  error: '#EF4444',
  surface: '#141428',
};

interface PostPreviewProps {
  content: PostContent;
  platform: SocialPlatform;
  mediaUri?: string;
  style?: ViewStyle;
}

// ─── Instagram preview ────────────────────────────────────────────────────────
const InstagramPreview: React.FC<{ content: PostContent; mediaUri?: string }> = ({
  content,
  mediaUri,
}) => (
  <View style={igStyles.card}>
    {/* Header */}
    <View style={igStyles.header}>
      <View style={igStyles.avatar}>
        <Ionicons name="person" size={18} color={COLORS.textSecondary} />
      </View>
      <View style={igStyles.nameGroup}>
        <Text style={igStyles.username}>your_brand</Text>
        <Text style={igStyles.location}>Your Location</Text>
      </View>
      <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textSecondary} />
    </View>

    {/* Media placeholder */}
    {mediaUri ? (
      <Image source={{ uri: mediaUri }} style={igStyles.media} resizeMode="cover" />
    ) : (
      <View style={igStyles.mediaPlaceholder}>
        <Ionicons name="image-outline" size={40} color={COLORS.textMuted} />
        <Text style={igStyles.mediaPlaceholderText}>Image / Video</Text>
      </View>
    )}

    {/* Actions */}
    <View style={igStyles.actions}>
      <View style={igStyles.leftActions}>
        <Ionicons name="heart-outline" size={22} color={COLORS.textPrimary} />
        <Ionicons name="chatbubble-outline" size={20} color={COLORS.textPrimary} />
        <Ionicons name="paper-plane-outline" size={20} color={COLORS.textPrimary} />
      </View>
      <Ionicons name="bookmark-outline" size={20} color={COLORS.textPrimary} />
    </View>

    {/* Caption */}
    <View style={igStyles.caption}>
      <Text style={igStyles.captionText}>
        <Text style={igStyles.captionBold}>your_brand </Text>
        {content.hook ? `${content.hook}\n\n${content.body}` : content.body}
      </Text>
      {content.hashtags.length > 0 && (
        <Text style={igStyles.hashtags}>
          {content.hashtags.map((h) => `#${h}`).join(' ')}
        </Text>
      )}
    </View>
  </View>
);

const igStyles = StyleSheet.create({
  card: {
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1306C',
  },
  nameGroup: {
    flex: 1,
  },
  username: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  location: {
    fontSize: 11,
    color: '#A0A0A0',
  },
  media: {
    width: '100%',
    aspectRatio: 1,
  },
  mediaPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mediaPlaceholderText: {
    fontSize: 13,
    color: '#606060',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  caption: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  captionText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
  },
  captionBold: {
    fontWeight: '700',
  },
  hashtags: {
    marginTop: 6,
    fontSize: 13,
    color: '#2E78D0',
    lineHeight: 19,
  },
});

// ─── Twitter/X preview ────────────────────────────────────────────────────────
const TwitterPreview: React.FC<{ content: PostContent }> = ({ content }) => (
  <View style={twStyles.card}>
    <View style={twStyles.avatar}>
      <Ionicons name="person" size={18} color={COLORS.textSecondary} />
    </View>
    <View style={twStyles.contentCol}>
      <View style={twStyles.nameRow}>
        <Text style={twStyles.name}>Your Brand</Text>
        <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
        <Text style={twStyles.handle}>@your_brand</Text>
        <Text style={twStyles.dot}>·</Text>
        <Text style={twStyles.time}>now</Text>
      </View>
      <Text style={twStyles.tweetText}>
        {content.hook ? `${content.hook}\n\n${content.body}` : content.body}
      </Text>
      {content.hashtags.length > 0 && (
        <Text style={twStyles.hashtags}>
          {content.hashtags.map((h) => `#${h}`).join(' ')}
        </Text>
      )}
      <View style={twStyles.actions}>
        <View style={twStyles.actionItem}>
          <Ionicons name="chatbubble-outline" size={16} color="#606080" />
          <Text style={twStyles.actionCount}>0</Text>
        </View>
        <View style={twStyles.actionItem}>
          <Ionicons name="repeat-outline" size={16} color="#606080" />
          <Text style={twStyles.actionCount}>0</Text>
        </View>
        <View style={twStyles.actionItem}>
          <Ionicons name="heart-outline" size={16} color="#606080" />
          <Text style={twStyles.actionCount}>0</Text>
        </View>
        <View style={twStyles.actionItem}>
          <Ionicons name="bar-chart-outline" size={16} color="#606080" />
          <Text style={twStyles.actionCount}>0</Text>
        </View>
      </View>
    </View>
  </View>
);

const twStyles = StyleSheet.create({
  card: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  handle: {
    fontSize: 13,
    color: '#606080',
  },
  dot: {
    fontSize: 13,
    color: '#606080',
  },
  time: {
    fontSize: 13,
    color: '#606080',
  },
  tweetText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 6,
  },
  hashtags: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 19,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 6,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    color: '#606080',
  },
});

// ─── LinkedIn preview ─────────────────────────────────────────────────────────
const LinkedInPreview: React.FC<{ content: PostContent }> = ({ content }) => (
  <View style={liStyles.card}>
    <View style={liStyles.header}>
      <View style={liStyles.avatar}>
        <Ionicons name="person" size={18} color={COLORS.textSecondary} />
      </View>
      <View style={liStyles.nameGroup}>
        <Text style={liStyles.name}>Your Brand</Text>
        <Text style={liStyles.tagline}>Your Professional Tagline</Text>
        <Text style={liStyles.time}>Just now • 🌐</Text>
      </View>
      <Ionicons name="add-circle-outline" size={20} color="#0A66C2" />
    </View>
    <Text style={liStyles.body}>
      {content.hook ? `${content.hook}\n\n${content.body}` : content.body}
    </Text>
    {content.hashtags.length > 0 && (
      <Text style={liStyles.hashtags}>
        {content.hashtags.map((h) => `#${h}`).join(' ')}
      </Text>
    )}
    <View style={liStyles.divider} />
    <View style={liStyles.actions}>
      {['thumbs-up-outline', 'chatbubble-outline', 'repeat-outline', 'paper-plane-outline'].map(
        (iconName) => (
          <View key={iconName} style={liStyles.actionItem}>
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={16}
              color="#A0A0C0"
            />
          </View>
        )
      )}
    </View>
  </View>
);

const liStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1B1F23',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameGroup: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 1,
  },
  time: {
    fontSize: 11,
    color: '#606060',
    marginTop: 2,
  },
  body: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 21,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  hashtags: {
    fontSize: 13,
    color: '#4B9CD3',
    paddingHorizontal: 12,
    paddingBottom: 12,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

// ─── Generic fallback preview ─────────────────────────────────────────────────
const GenericPreview: React.FC<{ content: PostContent; platform: SocialPlatform }> = ({
  content,
  platform,
}) => (
  <View style={genStyles.card}>
    <View style={genStyles.header}>
      <View style={genStyles.avatar}>
        <Ionicons name="person" size={18} color={COLORS.textSecondary} />
      </View>
      <View>
        <Text style={genStyles.name}>Your Brand</Text>
        <Text style={genStyles.platform}>{platform}</Text>
      </View>
    </View>
    <Text style={genStyles.body}>
      {content.hook ? `${content.hook}\n\n${content.body}` : content.body}
    </Text>
    {content.hashtags.length > 0 && (
      <Text style={genStyles.hashtags}>
        {content.hashtags.map((h) => `#${h}`).join(' ')}
      </Text>
    )}
  </View>
);

const genStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${COLORS.primary}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  platform: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
  body: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 8,
  },
  hashtags: {
    fontSize: 13,
    color: COLORS.primary,
    lineHeight: 19,
  },
});

// ─── Main PostPreview component ───────────────────────────────────────────────
const PostPreview: React.FC<PostPreviewProps> = ({
  content,
  platform,
  mediaUri,
  style,
}) => {
  const charLimit = PLATFORM_CHAR_LIMITS[platform];
  const totalChars =
    (content.hook?.length ?? 0) + content.body.length;
  const remaining = charLimit ? charLimit - totalChars : null;

  const renderPreview = () => {
    switch (platform) {
      case 'instagram':
        return <InstagramPreview content={content} mediaUri={mediaUri} />;
      case 'twitter':
        return <TwitterPreview content={content} />;
      case 'linkedin':
        return <LinkedInPreview content={content} />;
      default:
        return <GenericPreview content={content} platform={platform} />;
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {renderPreview()}
      {remaining !== null && (
        <View style={styles.charRow}>
          <Text
            style={[
              styles.charCount,
              remaining < 0
                ? styles.charOver
                : remaining < 20
                ? styles.charNear
                : styles.charOk,
            ]}
          >
            {remaining >= 0 ? `${remaining} chars remaining` : `${Math.abs(remaining)} chars over limit`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  charRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  charOk: {
    color: COLORS.textMuted,
  },
  charNear: {
    color: '#F59E0B',
  },
  charOver: {
    color: COLORS.error,
  },
});

export default PostPreview;
