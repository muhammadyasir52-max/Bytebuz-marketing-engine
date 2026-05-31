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
  surface: '#141428',
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
    case 'scheduled': return 'info';
    case 'posted': return 'success';
    case 'draft': return 'muted';
    case 'pending_review': return 'warning';
    case 'failed': return 'error';
    default: return 'muted';
  }
}

function getStatusLabel(status: Post['status']): string {
  switch (status) {
    case 'scheduled': return 'Scheduled';
    case 'posted': return 'Posted';
    case 'draft': return 'Draft';
    case 'pending_review': return 'Review';
    case 'failed': return 'Failed';
    default: return status;
  }
}

interface ScheduledPostRowProps {
  post: Post;
  onPress: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

const ScheduledPostRow: React.FC<ScheduledPostRowProps> = ({
  post,
  onPress,
  onLongPress,
  style,
}) => {
  const scheduledTime = post.schedule?.scheduledAt
    ? formatTime(post.schedule.scheduledAt)
    : '—';

  const preview = post.content.hook || post.content.body;
  const truncated = preview.length > 80 ? preview.slice(0, 80) + '…' : preview;

  return (
    <TouchableOpacity
      style={[styles.row, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      delayLongPress={400}
    >
      {/* Time column */}
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{scheduledTime}</Text>
        <View style={styles.timeLine} />
      </View>

      {/* Content card */}
      <View style={styles.contentCard}>
        {/* Platform icons row */}
        <View style={styles.platformRow}>
          {post.platforms.slice(0, 4).map((platform) => (
            <PlatformIcon
              key={platform}
              platform={platform}
              size="sm"
              style={styles.platformIcon}
            />
          ))}
          {post.platforms.length > 4 && (
            <View style={styles.morePlatforms}>
              <Text style={styles.morePlatformsText}>+{post.platforms.length - 4}</Text>
            </View>
          )}
          <View style={styles.flex1} />
          <Badge
            label={getStatusLabel(post.status)}
            variant={getStatusBadgeVariant(post.status)}
            size="sm"
          />
        </View>

        {/* Preview text */}
        <Text style={styles.preview} numberOfLines={2}>
          {truncated}
        </Text>

        {/* Content type */}
        <Text style={styles.contentType}>
          {post.contentType.replace('_', ' ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  timeColumn: {
    width: 56,
    alignItems: 'center',
    paddingTop: 14,
  },
  time: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  timeLine: {
    width: 1,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 6,
    minHeight: 20,
  },
  contentCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginLeft: 10,
    marginBottom: 10,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  platformIcon: {
    // compact spacing
  },
  morePlatforms: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
  },
  morePlatformsText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
  },
  flex1: {
    flex: 1,
  },
  preview: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  contentType: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
});

export default ScheduledPostRow;
