import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Post } from '@/types';

// ─── Default Config ───────────────────────────────────────────────────────────

const DEFAULT_LEAD_TIME_MINUTES = 30;

// ─── Setup ────────────────────────────────────────────────────────────────────

/**
 * Sets up the notification handler. Call this once on app start (in App.tsx or root layout).
 * Configures how notifications are presented when the app is in the foreground.
 */
export function setupNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Android channel setup
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('post-reminders', {
      name: 'Post Reminders',
      description: 'Reminders to publish your scheduled social media posts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#5B4FE9',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
  }
}

// ─── Request Permissions ──────────────────────────────────────────────────────

/**
 * Requests notification permissions from the user.
 * Returns true if permissions were granted, false otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowProvisional: false,
    },
  });

  return status === 'granted';
}

// ─── Schedule Post Reminder ───────────────────────────────────────────────────

/**
 * Schedules a local push notification reminder for a post.
 *
 * The notification fires `leadTimeMinutes` before the post's scheduledAt time.
 * Returns the Expo notification identifier (use to cancel later).
 *
 * @param post - The post with a valid schedule.scheduledAt
 * @param leadTimeMinutes - Minutes before publish time to remind (default: 30)
 */
export async function schedulePostReminder(
  post: Post,
  leadTimeMinutes = DEFAULT_LEAD_TIME_MINUTES
): Promise<string> {
  if (!post.schedule) {
    throw new Error(`Cannot schedule reminder: post ${post.id} has no schedule`);
  }

  const scheduledAt = new Date(post.schedule.scheduledAt);
  const reminderTime = new Date(scheduledAt.getTime() - leadTimeMinutes * 60 * 1000);
  const now = new Date();

  if (reminderTime <= now) {
    throw new Error(
      `Cannot schedule reminder: reminder time (${reminderTime.toISOString()}) is in the past`
    );
  }

  const platformNames = post.platforms
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(', ');

  const hook = post.content.hook || 'your post';
  const shortHook = hook.length > 60 ? `${hook.slice(0, 57)}...` : hook;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to publish on ${platformNames}!`,
      body: `Your post goes live in ${leadTimeMinutes} minutes: "${shortHook}"`,
      data: {
        postId: post.id,
        platforms: post.platforms,
        scheduledAt: post.schedule.scheduledAt,
        type: 'post_reminder',
      },
      sound: 'default',
      ...(Platform.OS === 'android' && {
        channelId: 'post-reminders',
        color: '#5B4FE9',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderTime,
    },
  });

  return notificationId;
}

// ─── Cancel Notification ──────────────────────────────────────────────────────

/**
 * Cancels a previously scheduled notification by its identifier.
 * Safe to call even if the notification has already fired or doesn't exist.
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// ─── Cancel All Post Notifications ───────────────────────────────────────────

/**
 * Cancels all scheduled notifications (use on logout or bulk rescheduling).
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Get Scheduled Notifications ─────────────────────────────────────────────

/**
 * Returns all currently scheduled notification identifiers.
 */
export async function getAllScheduledNotifications(): Promise<
  Awaited<ReturnType<typeof Notifications.getAllScheduledNotificationsAsync>>
> {
  return Notifications.getAllScheduledNotificationsAsync();
}

// ─── Schedule Publish Success Notification ────────────────────────────────────

/**
 * Sends an immediate local notification confirming a post was published.
 */
export async function notifyPostPublished(post: Post, platformNames: string[]): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Post Published!',
      body: `Your post is now live on ${platformNames.join(', ')}.`,
      data: {
        postId: post.id,
        type: 'post_published',
      },
      sound: 'default',
      ...(Platform.OS === 'android' && {
        channelId: 'post-reminders',
        color: '#22C55E',
      }),
    },
    trigger: null, // null = send immediately
  });
}

// ─── Schedule Post Failed Notification ───────────────────────────────────────

/**
 * Sends an immediate local notification when a post fails to publish.
 */
export async function notifyPostFailed(post: Post, reason: string): Promise<void> {
  const platformNames = post.platforms
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(', ');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Post Failed to Publish',
      body: `Your post on ${platformNames} could not be published. Tap to review.`,
      data: {
        postId: post.id,
        type: 'post_failed',
        reason,
      },
      sound: 'default',
      ...(Platform.OS === 'android' && {
        channelId: 'post-reminders',
        color: '#EF4444',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    },
    trigger: null,
  });
}
