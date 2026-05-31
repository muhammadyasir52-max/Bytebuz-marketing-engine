import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocialPlatform, PlatformAnalytics, AnalyticsPeriod } from '@/types';

interface AnalyticsStore {
  analyticsCache: Record<string, PlatformAnalytics>;
  selectedPeriod: AnalyticsPeriod;
  isLoading: boolean;
  lastSyncedAt: string | null;

  setAnalytics: (platform: SocialPlatform, data: PlatformAnalytics) => void;
  setSelectedPeriod: (period: AnalyticsPeriod) => void;
  setLoading: (isLoading: boolean) => void;
  clearCache: () => void;
}

/**
 * Generates a cache key from platform + period to support separate caches
 * per time window.
 */
function cacheKey(platform: SocialPlatform, period: AnalyticsPeriod): string {
  return `${platform}:${period}`;
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set) => ({
      analyticsCache: {},
      selectedPeriod: '30d',
      isLoading: false,
      lastSyncedAt: null,

      setAnalytics: (platform, data) =>
        set((state) => ({
          analyticsCache: {
            ...state.analyticsCache,
            [cacheKey(platform, data.period)]: data,
          },
          lastSyncedAt: new Date().toISOString(),
        })),

      setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),

      setLoading: (isLoading) => set({ isLoading }),

      clearCache: () => set({ analyticsCache: {}, lastSyncedAt: null }),
    }),
    {
      name: 'analytics-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * Convenience selector — retrieves cached analytics for a specific
 * platform + period combination.
 */
export function selectPlatformAnalytics(
  store: AnalyticsStore,
  platform: SocialPlatform,
  period: AnalyticsPeriod,
): PlatformAnalytics | undefined {
  return store.analyticsCache[cacheKey(platform, period)];
}
