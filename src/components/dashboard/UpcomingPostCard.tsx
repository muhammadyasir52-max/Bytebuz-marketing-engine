import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Post } from '@/types';
import PlatformIcon from '../common/PlatformIcon';
import Badge from '../common/Badge';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  primary: '#7C3AED',
  accent: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${period}`;
}

function getStatusBadgeVariant(
  status: Post['status']
): 'success' | 'warning' | 'error' | 'info' | 'primary' | 'muted' {
  switch (status) {
    case 'scheduled':
      return 'info';
    case 'posted':
      return 'success';
    case 'draft':
      return 'muted';
    case 'pending_review':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'muted';
  }
}

function getStatusLabel(status: Post['status']): string {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';
    case 'posted':
      return 'Posted';
    case 'draft':
      return 'Draft';
    case 'pending_review':
      return 'Review';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
}

interface UpcomingPostCardProps {
  post: Post;
  onPress: () => void;
  style?: ViewStyle;
}

const UpcomingPostCard: React.FC<UpcomingPostCardProps> = ({
  post,
  onPress,
  style,
}) => {
  const scheduledTime = post.schedule?.scheduledAt
    ? formatTime(post.schedule.scheduledAt)
    : 'Unscheduled';

  const previewText = post.content.hook || post.content.body;
  const truncated =
    previewText.length > 72 ? previewText.slice(0, 72) + '…' : previewText;

  const primaryPlatform = post.platforms[0];

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Time strip */}
      <View style={styles.timeRow}>
        <Text style={styles.time}>{scheduledTime}</Text>
        <Badge
          label={getStatusLabel(post.status)}
          variant={getStatusBadgeVariant(post.status)}
          size="sm"
        />
      </View>

      {/* Content row */}
      <View style={styles.contentRow}>
        {primaryPlatform && (
          <PlatformIcon platform={primaryPlatform} size="sm" style={styles.platformIcon} />
        )}
        <Text style={styles.preview} numberOfLines={2}>
          {truncated}
        </Text>
      </View>

      {/* Extra platform badges if multiple */}
      {post.platforms.length > 1 && (
        <View style={styles.extraPlatforms}>
          {post.platforms.slice(1).map((p) => (
            <PlatformIcon key={p} platform={p} size="sm" style={styles.extraIcon} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    width: 200,
    marginRight: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  platformIcon: {
    marginTop: 2,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  extraPlatforms: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 6,
  },
  extraIcon: {
    // minimal spacing
  },
});

export default UpcomingPostCard;
