import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { usePostStore } from '@/store/usePostStore';
import { Post, SocialPlatform } from '@/types';
import PlatformIcon from '@/components/common/PlatformIcon';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  accent: '#10B981',
  error: '#EF4444',
};

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  twitter: '#000000',
  tiktok: '#FF0050',
  youtube: '#FF0000',
};

function toDateString(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return d.toISOString().split('T')[0];
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${period}`;
}

function getStatusBadgeVariant(
  status: Post['status'],
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
  onLongPress: () => void;
}

function ScheduledPostRow({ post, onPress, onLongPress }: ScheduledPostRowProps) {
  const time = post.schedule?.scheduledAt
    ? formatTime(post.schedule.scheduledAt)
    : 'Unscheduled';
  const preview = (post.content.hook || post.content.body).slice(0, 80);

  return (
    <TouchableOpacity
      style={styles.postRow}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={styles.postRowTime}>
        <Text style={styles.postTime}>{time}</Text>
      </View>
      <View style={styles.postRowContent}>
        <View style={styles.postRowHeader}>
          <View style={styles.platformIcons}>
            {post.platforms.slice(0, 3).map((p) => (
              <PlatformIcon key={p} platform={p} size="sm" style={styles.platformIconItem} />
            ))}
          </View>
          <Badge
            label={getStatusLabel(post.status)}
            variant={getStatusBadgeVariant(post.status)}
            size="sm"
          />
        </View>
        <Text style={styles.postPreview} numberOfLines={2}>
          {preview}
          {preview.length === 80 ? '…' : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function CalendarScreen() {
  const { drafts, scheduled, posted, getPostsByDate, deletePost, updatePost } = usePostStore();
  const [selectedDate, setSelectedDate] = useState<string>(toDateString(new Date()));
  const [refreshing, setRefreshing] = useState(false);

  const allPosts = [...drafts, ...scheduled, ...posted];

  const markedDates: Record<string, any> = {};
  allPosts.forEach((post) => {
    const dateStr = post.schedule?.scheduledAt
      ? toDateString(post.schedule.scheduledAt)
      : toDateString(post.createdAt);

    const dots = post.platforms.slice(0, 3).map((p) => ({
      key: p,
      color: PLATFORM_COLORS[p] ?? COLORS.primary,
    }));

    if (markedDates[dateStr]) {
      markedDates[dateStr].dots = [...(markedDates[dateStr].dots ?? []), ...dots];
    } else {
      markedDates[dateStr] = { dots };
    }
  });

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: COLORS.primary,
    };
  }

  const selectedDatePosts = getPostsByDate(new Date(selectedDate + 'T00:00:00'));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const showPostActions = (post: Post) => {
    const options = ['Edit', 'Post Now', 'Reschedule', 'Delete', 'Cancel'];
    const destructiveIndex = 3;
    const cancelIndex = 4;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: destructiveIndex,
          cancelButtonIndex: cancelIndex,
        },
        (index) => {
          if (index === 0) router.push(`/post/${post.id}` as any);
          if (index === 1) Alert.alert('Post Now', 'This would post immediately via Ayrshare.');
          if (index === 2) router.push(`/post/${post.id}` as any);
          if (index === 3) {
            Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deletePost(post.id) },
            ]);
          }
        },
      );
    } else {
      Alert.alert('Post Actions', '', [
        { text: 'Edit', onPress: () => router.push(`/post/${post.id}` as any) },
        { text: 'Post Now', onPress: () => Alert.alert('Post Now', 'Posting via Ayrshare...') },
        { text: 'Reschedule', onPress: () => router.push(`/post/${post.id}` as any) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Delete Post', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deletePost(post.id) },
            ]),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const formattedSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Content Calendar</Text>
        </View>

        <Calendar
          theme={{
            backgroundColor: COLORS.background,
            calendarBackground: COLORS.card,
            dayTextColor: COLORS.textPrimary,
            textDisabledColor: COLORS.textMuted,
            selectedDayTextColor: COLORS.textPrimary,
            selectedDayBackgroundColor: COLORS.primary,
            todayTextColor: COLORS.primary,
            dotColor: COLORS.primary,
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.textPrimary,
            textMonthFontWeight: '700',
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
            textDayHeaderFontWeight: '600',
            textDayFontSize: 14,
          }}
          style={styles.calendar}
          markedDates={markedDates}
          markingType="multi-dot"
          onDayPress={handleDayPress}
          enableSwipeMonths
        />

        {/* Day detail */}
        <View style={styles.dayDetail}>
          <Text style={styles.dayTitle}>Scheduled for {formattedSelectedDate}</Text>
          {selectedDatePosts.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="No posts on this day"
              subtitle="Generate content to fill your calendar"
              action={{
                label: 'Create Post',
                onPress: () => router.push('/(tabs)/generate'),
              }}
              style={styles.emptyState}
            />
          ) : (
            <View style={styles.postsList}>
              {selectedDatePosts.map((post) => (
                <ScheduledPostRow
                  key={post.id}
                  post={post}
                  onPress={() => router.push(`/post/${post.id}` as any)}
                  onLongPress={() => showPostActions(post)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/generate')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  calendar: {
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayDetail: { paddingHorizontal: 20, paddingTop: 24 },
  dayTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  emptyState: { minHeight: 180 },
  postsList: { gap: 10 },
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
  postRowTime: {
    minWidth: 52,
    alignItems: 'center',
  },
  postTime: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  postRowContent: { flex: 1 },
  postRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  platformIcons: { flexDirection: 'row', gap: 4 },
  platformIconItem: {},
  postPreview: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
