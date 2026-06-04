import dayjs from 'dayjs';
import { SocialPlatform, PostFrequency, ScheduledSlot, BulkScheduleOptions } from '@/types';
import { PLATFORMS } from '@/constants/platforms';

export function getOptimalTimes(platform: SocialPlatform): string[] {
  return PLATFORMS.find((p) => p.id === platform)?.bestPostTimes ?? ['09:00', '12:00', '17:00'];
}

export function getFrequencyIntervalDays(frequency: PostFrequency): number {
  const map: Record<PostFrequency, number> = {
    daily: 1,
    '3x_week': 2,
    '2x_week': 3,
    weekly: 7,
  };
  return map[frequency] ?? 1;
}

export function getFrequencyLabel(frequency: PostFrequency): string {
  const labels: Record<PostFrequency, string> = {
    daily: 'Every day',
    '3x_week': '3× per week',
    '2x_week': '2× per week',
    weekly: 'Once a week',
  };
  return labels[frequency] ?? frequency;
}

export function generateBulkSchedule(options: BulkScheduleOptions): ScheduledSlot[] {
  const { platforms, startDate, endDate, frequency, useOptimalTimes, customTimes } = options;
  const slots: ScheduledSlot[] = [];
  const interval = getFrequencyIntervalDays(frequency);

  let current = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');

  while (!current.isAfter(end)) {
    for (const platform of platforms) {
      const times = useOptimalTimes
        ? getOptimalTimes(platform)
        : (customTimes?.[platform] ?? getOptimalTimes(platform));

      const time = times[0] ?? '09:00';
      const [hoursStr, minutesStr] = time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr ?? '0', 10);

      const scheduledAt = current
        .set('hour', hours)
        .set('minute', minutes)
        .set('second', 0)
        .set('millisecond', 0)
        .toISOString();

      slots.push({
        date: current.format('YYYY-MM-DD'),
        time,
        platform,
        scheduledAt,
      });
    }

    current = current.add(interval, 'day');
  }

  return slots;
}

export function getNextTriggerDate(frequency: PostFrequency, lastDate?: string): string {
  const interval = getFrequencyIntervalDays(frequency);
  const base = lastDate ? dayjs(lastDate) : dayjs();
  return base.add(interval, 'day').toISOString();
}

export function formatQueueTime(isoString: string): string {
  return dayjs(isoString).format('h:mm A');
}

export function formatQueueDate(isoString: string): string {
  const d = dayjs(isoString);
  const today = dayjs();
  if (d.isSame(today, 'day')) return 'Today';
  if (d.isSame(today.add(1, 'day'), 'day')) return 'Tomorrow';
  return d.format('MMM D');
}

export function countBulkPosts(options: BulkScheduleOptions): number {
  return generateBulkSchedule(options).length;
}
