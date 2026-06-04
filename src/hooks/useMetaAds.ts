import { useCallback, useState } from 'react';
import { MetaCampaign, MetaAdStatus, MetaAdCopyVariant, MetaAdTargeting, MetaAdCTAType } from '@/types';
import { useMetaAdsStore } from '@/store/useMetaAdsStore';
import { useBusinessStore } from '@/store/useBusinessStore';
import { MetaAdsService, CreateCampaignParams, CreateAdSetParams } from '@/services/metaAds/metaAdsService';
import { AdCopyService, GenerateAdCopyParams } from '@/services/claude/adCopyService';
import {
  getMetaAccessToken,
  getMetaAdAccountId,
  getClaudeApiKey,
  saveMetaAccessToken,
  saveMetaAdAccountId,
  saveMetaPageId,
} from '@/services/storage/secureStorage';
import type { MetaDatePreset } from '@/services/metaAds/metaAdsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getMetaService(): Promise<{ service: MetaAdsService; accountId: string } | null> {
  const [token, accountId] = await Promise.all([getMetaAccessToken(), getMetaAdAccountId()]);
  if (!token || !accountId) return null;
  return { service: new MetaAdsService(token), accountId };
}

async function getAdCopyService(): Promise<AdCopyService | null> {
  const key = await getClaudeApiKey();
  return key ? new AdCopyService(key) : null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseMetaAdsReturn {
  isWorking: boolean;
  error: string | null;
  clearError: () => void;

  // Connection
  connect: (accessToken: string, adAccountId: string, pageId?: string) => Promise<boolean>;
  disconnect: () => void;
  syncAccount: () => Promise<void>;

  // Campaigns
  fetchCampaigns: () => Promise<void>;
  createCampaign: (params: CreateCampaignParams) => Promise<MetaCampaign | null>;
  pauseCampaign: (campaignId: string) => Promise<boolean>;
  resumeCampaign: (campaignId: string) => Promise<boolean>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  fetchCampaignInsights: (campaignId: string, datePreset?: MetaDatePreset) => Promise<void>;

  // Ad sets
  fetchAdSets: (campaignId: string) => Promise<void>;
  createAdSet: (params: CreateAdSetParams) => Promise<boolean>;

  // AI Copy generation
  generateAdCopy: (params: Omit<GenerateAdCopyParams, 'businessProfile'>) => Promise<MetaAdCopyVariant[]>;
  generateAudienceSuggestions: (product: string) => Promise<void>;
  analyzeCampaignPerformance: (campaignId: string) => Promise<string | null>;
}

export function useMetaAds(): UseMetaAdsReturn {
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    setConnected, setAdAccount, setCampaigns, addCampaign, updateCampaign,
    removeCampaign, setAdSets, setAccountInsights, setGeneratedCopies,
    setLoading, setSyncing, setError: storeSetError, markSynced, campaigns,
  } = useMetaAdsStore();

  const { profile } = useBusinessStore();

  const clearError = useCallback(() => setError(null), []);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setIsWorking(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        return null;
      } finally {
        setIsWorking(false);
      }
    },
    []
  );

  // ─── Connect ─────────────────────────────────────────────────────────────

  const connect = useCallback(
    async (accessToken: string, adAccountId: string, pageId?: string): Promise<boolean> => {
      const result = await wrap(async () => {
        const service = new MetaAdsService(accessToken);
        const valid = await service.validateToken();
        if (!valid) throw new Error('Invalid Meta access token. Please check and try again.');

        await Promise.all([
          saveMetaAccessToken(accessToken),
          saveMetaAdAccountId(adAccountId),
          ...(pageId ? [saveMetaPageId(pageId)] : []),
        ]);

        const account = await service.getAdAccount(adAccountId);
        setAdAccount(account);
        setConnected(true, adAccountId);
        return true;
      });
      return result === true;
    },
    [wrap, setAdAccount, setConnected]
  );

  // ─── Disconnect ───────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    setConnected(false);
    setAdAccount(null);
    setCampaigns([]);
  }, [setConnected, setAdAccount, setCampaigns]);

  // ─── Sync Account ─────────────────────────────────────────────────────────

  const syncAccount = useCallback(async () => {
    const ctx = await getMetaService();
    if (!ctx) { setError('Meta Ads not connected. Configure credentials in settings.'); return; }
    setSyncing(true);
    try {
      const [account, insights, campaignList] = await Promise.all([
        ctx.service.getAdAccount(ctx.accountId),
        ctx.service.getAccountInsights(ctx.accountId, 'last_30d'),
        ctx.service.getCampaigns(ctx.accountId),
      ]);
      setAdAccount(account);
      setAccountInsights(insights);
      setCampaigns(campaignList);
      markSynced();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }, [setSyncing, setAdAccount, setAccountInsights, setCampaigns, markSynced]);

  // ─── Fetch Campaigns ──────────────────────────────────────────────────────

  const fetchCampaigns = useCallback(async () => {
    const ctx = await getMetaService();
    if (!ctx) return;
    setLoading(true);
    try {
      const list = await ctx.service.getCampaigns(ctx.accountId);
      setCampaigns(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setCampaigns]);

  // ─── Create Campaign ──────────────────────────────────────────────────────

  const createCampaign = useCallback(
    async (params: CreateCampaignParams): Promise<MetaCampaign | null> => {
      return wrap(async () => {
        const ctx = await getMetaService();
        if (!ctx) throw new Error('Meta Ads not connected.');
        const campaign = await ctx.service.createCampaign(ctx.accountId, params);
        addCampaign(campaign);
        return campaign;
      });
    },
    [wrap, addCampaign]
  );

  // ─── Pause / Resume Campaign ──────────────────────────────────────────────

  const pauseCampaign = useCallback(
    async (campaignId: string): Promise<boolean> => {
      const result = await wrap(async () => {
        const ctx = await getMetaService();
        if (!ctx) throw new Error('Meta Ads not connected.');
        await ctx.service.updateCampaignStatus(campaignId, 'PAUSED');
        updateCampaign(campaignId, { status: 'PAUSED' });
        return true;
      });
      return result === true;
    },
    [wrap, updateCampaign]
  );

  const resumeCampaign = useCallback(
    async (campaignId: string): Promise<boolean> => {
      const result = await wrap(async () => {
        const ctx = await getMetaService();
        if (!ctx) throw new Error('Meta Ads not connected.');
        await ctx.service.updateCampaignStatus(campaignId, 'ACTIVE');
        updateCampaign(campaignId, { status: 'ACTIVE' });
        return true;
      });
      return result === true;
    },
    [wrap, updateCampaign]
  );

  // ─── Delete Campaign ──────────────────────────────────────────────────────

  const deleteCampaign = useCallback(
    async (campaignId: string): Promise<boolean> => {
      const result = await wrap(async () => {
        const ctx = await getMetaService();
        if (!ctx) throw new Error('Meta Ads not connected.');
        await ctx.service.deleteCampaign(campaignId);
        removeCampaign(campaignId);
        return true;
      });
      return result === true;
    },
    [wrap, removeCampaign]
  );

  // ─── Campaign Insights ────────────────────────────────────────────────────

  const fetchCampaignInsights = useCallback(
    async (campaignId: string, datePreset: MetaDatePreset = 'last_7d') => {
      const ctx = await getMetaService();
      if (!ctx) return;
      try {
        const insights = await ctx.service.getCampaignInsights(campaignId, datePreset);
        updateCampaign(campaignId, { insights });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch insights');
      }
    },
    [updateCampaign]
  );

  // ─── Ad Sets ──────────────────────────────────────────────────────────────

  const fetchAdSets = useCallback(
    async (campaignId: string) => {
      const ctx = await getMetaService();
      if (!ctx) return;
      try {
        const adSets = await ctx.service.getAdSets(campaignId);
        setAdSets(campaignId, adSets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ad sets');
      }
    },
    [setAdSets]
  );

  const createAdSet = useCallback(
    async (params: CreateAdSetParams): Promise<boolean> => {
      const result = await wrap(async () => {
        const ctx = await getMetaService();
        if (!ctx) throw new Error('Meta Ads not connected.');
        await ctx.service.createAdSet(ctx.accountId, params);
        await fetchAdSets(params.campaignId);
        return true;
      });
      return result === true;
    },
    [wrap, fetchAdSets]
  );

  // ─── AI Ad Copy ───────────────────────────────────────────────────────────

  const generateAdCopy = useCallback(
    async (params: Omit<GenerateAdCopyParams, 'businessProfile'>): Promise<MetaAdCopyVariant[]> => {
      const result = await wrap(async () => {
        const service = await getAdCopyService();
        if (!service) throw new Error('Claude API key not configured. Add it in Settings.');
        if (!profile) throw new Error('Business profile not set up. Complete onboarding first.');

        const copies = await service.generateAdCopy({ ...params, businessProfile: profile });
        setGeneratedCopies(copies);
        return copies;
      });
      return result ?? [];
    },
    [wrap, profile, setGeneratedCopies]
  );

  // ─── AI Audience Suggestions ──────────────────────────────────────────────

  const generateAudienceSuggestions = useCallback(
    async (product: string) => {
      await wrap(async () => {
        const service = await getAdCopyService();
        if (!service) throw new Error('Claude API key not configured.');
        if (!profile) throw new Error('Business profile not set up.');
        await service.generateAudienceSuggestions({
          businessProfile: profile,
          campaignObjective: 'OUTCOME_ENGAGEMENT',
          product,
        });
      });
    },
    [wrap, profile]
  );

  // ─── AI Campaign Analysis ─────────────────────────────────────────────────

  const analyzeCampaignPerformance = useCallback(
    async (campaignId: string): Promise<string | null> => {
      return wrap(async () => {
        const service = await getAdCopyService();
        if (!service) throw new Error('Claude API key not configured.');
        if (!profile) throw new Error('Business profile not set up.');

        const campaign = campaigns.find((c) => c.id === campaignId);
        if (!campaign?.insights) throw new Error('No insights data for this campaign. Sync first.');

        const { accountInsights: acc } = useMetaAdsStore.getState();
        const currency = useMetaAdsStore.getState().adAccount?.currency ?? 'USD';

        return service.analyzeCampaignPerformance(profile, {
          name: campaign.name,
          objective: campaign.objective,
          spend: campaign.insights.spend,
          impressions: campaign.insights.impressions,
          clicks: campaign.insights.clicks,
          conversions: campaign.insights.conversions,
          ctr: campaign.insights.ctr,
          cpc: campaign.insights.cpc,
          currency,
        });
      });
    },
    [wrap, profile, campaigns]
  );

  return {
    isWorking,
    error,
    clearError,
    connect,
    disconnect,
    syncAccount,
    fetchCampaigns,
    createCampaign,
    pauseCampaign,
    resumeCampaign,
    deleteCampaign,
    fetchCampaignInsights,
    fetchAdSets,
    createAdSet,
    generateAdCopy,
    generateAudienceSuggestions,
    analyzeCampaignPerformance,
  };
}
