import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AutomationRule, SocialPlatform } from '@/types';

interface AutomationStore {
  rules: AutomationRule[];
  isGlobalEnabled: boolean;
  platformEnabled: Partial<Record<SocialPlatform, boolean>>;

  addRule: (rule: AutomationRule) => void;
  updateRule: (id: string, partial: Partial<AutomationRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  setGlobalEnabled: (enabled: boolean) => void;
  setPlatformEnabled: (platform: SocialPlatform, enabled: boolean) => void;
}

export const useAutomationStore = create<AutomationStore>()(
  persist(
    (set, get) => ({
      rules: [],
      isGlobalEnabled: false,
      platformEnabled: {},

      addRule: (rule) =>
        set((state) => ({ rules: [...state.rules, rule] })),

      updateRule: (id, partial) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, ...partial, updatedAt: new Date().toISOString() } : r,
          ),
        })),

      deleteRule: (id) =>
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) })),

      toggleRule: (id) => {
        const rule = get().rules.find((r) => r.id === id);
        if (!rule) return;
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id
              ? { ...r, isActive: !r.isActive, updatedAt: new Date().toISOString() }
              : r,
          ),
        }));
      },

      setGlobalEnabled: (enabled) => set({ isGlobalEnabled: enabled }),

      setPlatformEnabled: (platform, enabled) =>
        set((state) => ({
          platformEnabled: { ...state.platformEnabled, [platform]: enabled },
        })),
    }),
    {
      name: 'automation-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
