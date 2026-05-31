import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContentFramework, HookType } from '@/types';

interface SettingsStore {
  notificationsEnabled: boolean;
  reminderLeadTimeMinutes: number;
  dailyDigestEnabled: boolean;
  defaultFramework: ContentFramework;
  defaultHookType: HookType;
  autoHashtags: boolean;
  language: string;
  hasCompletedOnboarding: boolean;

  updateSettings: (partial: Partial<Omit<SettingsStore, 'updateSettings' | 'resetSettings'>>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  reminderLeadTimeMinutes: 60,
  dailyDigestEnabled: false,
  defaultFramework: 'AIDA' as ContentFramework,
  defaultHookType: 'relatable_story' as HookType,
  autoHashtags: true,
  language: 'en',
  hasCompletedOnboarding: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (partial) => set((state) => ({ ...state, ...partial })),

      resetSettings: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
