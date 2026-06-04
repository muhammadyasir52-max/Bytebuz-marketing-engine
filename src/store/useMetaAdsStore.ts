import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaAdAccount,
  MetaAdInsights,
  MetaAdCopyVariant,
} from '@/types';

interface MetaAdsStore {
  // Connection
  isConnected: boolean;
  adAccountId: string | null;
  adAccount: MetaAdAccount | null;

  // Data
  campaigns: MetaCampaign[];
  adSets: Record<string, MetaAdSet[]>;  // campaignId → adSets
  ads: Record<string, MetaAd[]>;        // adSetId → ads
  accountInsights: MetaAdInsights | null;

  // Generated copies
  generatedCopies: MetaAdCopyVariant[];

  // UI State
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  selectedCampaignId: string | null;
  error: string | null;

  // Connection
  setConnected: (connected: boolean, accountId?: string) => void;
  setAdAccount: (account: MetaAdAccount | null) => void;

  // Campaigns
  setCampaigns: (campaigns: MetaCampaign[]) => void;
  addCampaign: (campaign: MetaCampaign) => void;
  updateCampaign: (id: string, partial: Partial<MetaCampaign>) => void;
  removeCampaign: (id: string) => void;

  // Ad Sets
  setAdSets: (campaignId: string, adSets: MetaAdSet[]) => void;
  addAdSet: (adSet: MetaAdSet) => void;

  // Ads
  setAds: (adSetId: string, ads: MetaAd[]) => void;

  // Insights
  setAccountInsights: (insights: MetaAdInsights) => void;

  // Ad Copy
  setGeneratedCopies: (copies: MetaAdCopyVariant[]) => void;
  clearGeneratedCopies: () => void;

  // UI
  setLoading: (v: boolean) => void;
  setSyncing: (v: boolean) => void;
  setError: (msg: string | null) => void;
  setSelectedCampaignId: (id: string | null) => void;
  markSynced: () => void;
}

export const useMetaAdsStore = create<MetaAdsStore>()(
  persist(
    (set) => ({
      isConnected: false,
      adAccountId: null,
      adAccount: null,
      campaigns: [],
      adSets: {},
      ads: {},
      accountInsights: null,
      generatedCopies: [],
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,
      selectedCampaignId: null,
      error: null,

      setConnected: (connected, accountId) =>
        set({ isConnected: connected, adAccountId: accountId ?? null }),

      setAdAccount: (account) => set({ adAccount: account }),

      setCampaigns: (campaigns) => set({ campaigns }),

      addCampaign: (campaign) =>
        set((s) => ({ campaigns: [...s.campaigns, campaign] })),

      updateCampaign: (id, partial) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id ? { ...c, ...partial, updatedAt: new Date().toISOString() } : c
          ),
        })),

      removeCampaign: (id) =>
        set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),

      setAdSets: (campaignId, adSets) =>
        set((s) => ({ adSets: { ...s.adSets, [campaignId]: adSets } })),

      addAdSet: (adSet) =>
        set((s) => ({
          adSets: {
            ...s.adSets,
            [adSet.campaignId]: [...(s.adSets[adSet.campaignId] ?? []), adSet],
          },
        })),

      setAds: (adSetId, ads) =>
        set((s) => ({ ads: { ...s.ads, [adSetId]: ads } })),

      setAccountInsights: (insights) => set({ accountInsights: insights }),

      setGeneratedCopies: (copies) => set({ generatedCopies: copies }),
      clearGeneratedCopies: () => set({ generatedCopies: [] }),

      setLoading: (v) => set({ isLoading: v }),
      setSyncing: (v) => set({ isSyncing: v }),
      setError: (msg) => set({ error: msg }),
      setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),
      markSynced: () => set({ lastSyncedAt: new Date().toISOString() }),
    }),
    {
      name: 'meta-ads-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
