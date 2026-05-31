import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectedPlatform, SocialPlatform } from '@/types';

interface ConnectorsStore {
  connectedPlatforms: ConnectedPlatform[];
  isConnecting: boolean;
  connectingPlatform: SocialPlatform | null;

  addConnectedPlatform: (platform: ConnectedPlatform) => void;
  removeConnectedPlatform: (platform: SocialPlatform) => void;
  updatePlatformStatus: (
    platform: SocialPlatform,
    status: ConnectedPlatform['status'],
  ) => void;
  setConnecting: (isConnecting: boolean, platform?: SocialPlatform | null) => void;
  isConnected: (platform: SocialPlatform) => boolean;
}

export const useConnectorsStore = create<ConnectorsStore>()(
  persist(
    (set, get) => ({
      connectedPlatforms: [],
      isConnecting: false,
      connectingPlatform: null,

      addConnectedPlatform: (platform) =>
        set((state) => {
          // Replace if the platform already exists, otherwise append
          const existing = state.connectedPlatforms.findIndex(
            (p) => p.platform === platform.platform,
          );
          if (existing !== -1) {
            const updated = [...state.connectedPlatforms];
            updated[existing] = platform;
            return { connectedPlatforms: updated };
          }
          return { connectedPlatforms: [...state.connectedPlatforms, platform] };
        }),

      removeConnectedPlatform: (platform) =>
        set((state) => ({
          connectedPlatforms: state.connectedPlatforms.filter(
            (p) => p.platform !== platform,
          ),
        })),

      updatePlatformStatus: (platform, status) =>
        set((state) => ({
          connectedPlatforms: state.connectedPlatforms.map((p) =>
            p.platform === platform ? { ...p, status } : p,
          ),
        })),

      setConnecting: (isConnecting, platform = null) =>
        set({
          isConnecting,
          connectingPlatform: isConnecting ? platform ?? null : null,
        }),

      isConnected: (platform) => {
        const found = get().connectedPlatforms.find((p) => p.platform === platform);
        return found?.status === 'active';
      },
    }),
    {
      name: 'connectors-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
