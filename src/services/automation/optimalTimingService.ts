import { SocialPlatform, DayOfWeek, OptimalTimeSlot } from '@/types';

// ─── Research-backed optimal posting times per platform ───────────────────────
// Source: industry engagement studies (Sprout Social, HubSpot, Hootsuite).
// Format: [dayOfWeek (0=Sun), 'HH:MM', engagementScore 0-100, label]

type TimeEntry = [DayOfWeek, string, number, string];

const OPTIMAL_TIMES: Record<SocialPlatform, TimeEntry[]> = {
  instagram: [
    [1, '06:00', 88, 'Mon morning commute'],
    [2, '12:00', 92, 'Tue lunch peak'],
    [3, '12:00', 95, 'Wed lunch peak'],
    [3, '15:00', 85, 'Wed mid-afternoon'],
    [4, '12:00', 90, 'Thu lunch'],
    [5, '11:00', 82, 'Fri pre-lunch'],
    [6, '10:00', 78, 'Sat morning'],
    [0, '11:00', 75, 'Sun morning browse'],
  ],
  facebook: [
    [1, '09:00', 85, 'Mon morning'],
    [2, '09:00', 90, 'Tue morning peak'],
    [3, '09:00', 92, 'Wed morning peak'],
    [3, '14:00', 80, 'Wed afternoon'],
    [4, '09:00', 88, 'Thu morning'],
    [5, '09:00', 82, 'Fri morning'],
    [6, '12:00', 70, 'Sat midday'],
  ],
  linkedin: [
    [1, '07:30', 88, 'Mon pre-work'],
    [1, '17:30', 82, 'Mon commute home'],
    [2, '07:30', 92, 'Tue pre-work'],
    [3, '07:30', 95, 'Wed pre-work'],
    [3, '17:30', 85, 'Wed commute home'],
    [4, '07:30', 90, 'Thu pre-work'],
    [5, '07:30', 78, 'Fri pre-work'],
  ],
  twitter: [
    [1, '08:00', 82, 'Mon morning'],
    [2, '09:00', 88, 'Tue morning'],
    [3, '08:00', 92, 'Wed morning'],
    [3, '12:00', 85, 'Wed lunch'],
    [4, '08:00', 88, 'Thu morning'],
    [5, '09:00', 80, 'Fri morning'],
    [6, '12:00', 72, 'Sat afternoon'],
    [0, '12:00', 68, 'Sun afternoon'],
  ],
  tiktok: [
    [1, '19:00', 85, 'Mon evening'],
    [2, '19:00', 88, 'Tue evening'],
    [3, '19:00', 92, 'Wed evening'],
    [4, '19:00', 90, 'Thu evening'],
    [5, '20:00', 95, 'Fri night'],
    [6, '09:00', 88, 'Sat morning'],
    [6, '20:00', 90, 'Sat night'],
    [0, '16:00', 82, 'Sun afternoon'],
  ],
  youtube: [
    [1, '14:00', 78, 'Mon afternoon'],
    [3, '14:00', 85, 'Wed afternoon'],
    [4, '12:00', 88, 'Thu midday'],
    [5, '12:00', 90, 'Fri midday'],
    [6, '09:00', 92, 'Sat morning'],
    [6, '20:00', 88, 'Sat night'],
    [0, '09:00', 90, 'Sun morning'],
    [0, '20:00', 85, 'Sun night'],
  ],
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getOptimalSlots(platform: SocialPlatform): OptimalTimeSlot[] {
  return (OPTIMAL_TIMES[platform] ?? []).map(([dayOfWeek, time, engagementScore, label]) => ({
    platform,
    dayOfWeek,
    time,
    label,
    engagementScore,
  }));
}

export function getTopOptimalSlots(platform: SocialPlatform, count = 3): OptimalTimeSlot[] {
  return getOptimalSlots(platform)
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, count);
}

/**
 * Returns the next N scheduled ISO timestamps for a platform based on optimal times,
 * starting from `fromDate` (defaults to now).
 */
export function getNextOptimalDates(
  platform: SocialPlatform,
  count: number,
  fromDate: Date = new Date()
): string[] {
  const slots = getOptimalSlots(platform).sort((a, b) => b.engagementScore - a.engagementScore);
  if (slots.length === 0) return [];

  const results: string[] = [];
  const cursor = new Date(fromDate);
  cursor.setSeconds(0, 0);

  // Walk forward day by day and collect matching slots until we have `count`
  const maxDays = Math.ceil((count / slots.length) * 7) + 14; // safety bound
  for (let d = 0; d < maxDays && results.length < count; d++) {
    const dayOfWeek = cursor.getDay() as DayOfWeek;
    const matchingSlots = slots.filter((s) => s.dayOfWeek === dayOfWeek);
    for (const slot of matchingSlots) {
      if (results.length >= count) break;
      const [hh, mm] = slot.time.split(':').map(Number);
      const date = new Date(cursor);
      date.setHours(hh, mm, 0, 0);
      if (date > fromDate) {
        results.push(date.toISOString());
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return results.sort();
}

/**
 * Given a manual time like '09:00' and a list of days, returns the next N ISO
 * timestamps starting from `fromDate`.
 */
export function getNextManualDates(
  daysOfWeek: DayOfWeek[],
  postTimes: string[],
  count: number,
  fromDate: Date = new Date()
): string[] {
  if (daysOfWeek.length === 0 || postTimes.length === 0) return [];
  const results: string[] = [];
  const cursor = new Date(fromDate);
  cursor.setSeconds(0, 0);

  const maxDays = Math.ceil((count / (daysOfWeek.length * postTimes.length)) * 7) + 14;
  for (let d = 0; d < maxDays && results.length < count; d++) {
    const dayOfWeek = cursor.getDay() as DayOfWeek;
    if (daysOfWeek.includes(dayOfWeek)) {
      for (const time of postTimes) {
        if (results.length >= count) break;
        const [hh, mm] = time.split(':').map(Number);
        const date = new Date(cursor);
        date.setHours(hh, mm, 0, 0);
        if (date > fromDate) {
          results.push(date.toISOString());
        }
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return results.sort();
}

export function formatDayLabel(day: DayOfWeek): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
}
