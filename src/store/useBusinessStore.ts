import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessProfile } from '@/types';

interface BusinessStore {
  profile: BusinessProfile | null;
  isOnboarded: boolean;
  onboardingStep: number;
  setProfile: (profile: BusinessProfile) => void;
  updateProfile: (partial: Partial<BusinessProfile>) => void;
  setOnboarded: (onboarded: boolean) => void;
  setOnboardingStep: (step: number) => void;
  clearProfile: () => void;
}

export const useBusinessStore = create<BusinessStore>()(
  persist(
    (set) => ({
      profile: null,
      isOnboarded: false,
      onboardingStep: 0,

      setProfile: (profile) => set({ profile }),

      updateProfile: (partial) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...partial, updatedAt: new Date().toISOString() }
            : null,
        })),

      setOnboarded: (isOnboarded) => set({ isOnboarded }),

      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),

      clearProfile: () =>
        set({ profile: null, isOnboarded: false, onboardingStep: 0 }),
    }),
    {
      name: 'business-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
