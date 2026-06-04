import {
  MetaCampaign,
  MetaCampaignObjective,
  MetaAdStatus,
  MetaAdSet,
  MetaAdTargeting,
  MetaAdCreative,
  MetaAdCTAType,
  MetaAd,
  MetaAdInsights,
  MetaAdAccount,
} from '@/types';

// ─── Meta Marketing API v18 ───────────────────────────────────────────────────

const API_VERSION = 'v18.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

export type MetaDatePreset =
  | 'today'
  | 'yesterday'
  | 'last_7d'
  | 'last_14d'
  | 'last_30d'
  | 'this_month'
  | 'last_month';

// ─── Raw API Shapes ───────────────────────────────────────────────────────────

interface MetaAPIError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
}

interface MetaAPIResponse<T> {
  data?: T[];
  error?: MetaAPIError;
  id?: string;
  success?: boolean;
}

interface RawCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
  created_time?: string;
  updated_time?: string;
  insights?: { data: RawInsights[] };
}

interface RawAdSet {
  id: string;
  campaign_id: string;
  name: string;
  status: string;
  daily_budget?: string;
  billing_event?: string;
  optimization_goal?: string;
  targeting?: {
    age_min?: number;
    age_max?: number;
    geo_locations?: { countries?: string[] };
    flexible_spec?: Array<{ interests?: Array<{ id: string; name: string }> }>;
    genders?: number[];
  };
  start_time?: string;
  end_time?: string;
  insights?: { data: RawInsights[] };
}

interface RawAd {
  id: string;
  adset_id: string;
  name: string;
  status: string;
  creative?: { id: string };
  created_time?: string;
  insights?: { data: RawInsights[] };
}

interface RawInsights {
  impressions?: string;
  reach?: string;
  clicks?: string;
  spend?: string;
  cpc?: string;
  ctr?: string;
  cpm?: string;
  conversions?: string;
  date_start?: string;
  date_stop?: string;
}

interface RawCreative {
  id: string;
  name?: string;
  object_story_spec?: {
    page_id?: string;
    link_data?: {
      message?: string;
      name?: string;
      description?: string;
      link?: string;
      call_to_action?: { type?: string };
      image_hash?: string;
    };
  };
  image_url?: string;
  video_id?: string;
}

// ─── Create Params ────────────────────────────────────────────────────────────

export interface CreateCampaignParams {
  name: string;
  objective: MetaCampaignObjective;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  endTime?: string;
  status?: MetaAdStatus;
}

export interface CreateAdSetParams {
  campaignId: string;
  name: string;
  dailyBudget: number;
  targeting: MetaAdTargeting;
  billingEvent?: string;
  optimizationGoal?: string;
  startTime?: string;
  endTime?: string;
  status?: MetaAdStatus;
}

export interface CreateAdCreativeParams {
  name: string;
  pageId: string;
  primaryText: string;
  headline: string;
  description?: string;
  callToAction: MetaAdCTAType;
  linkUrl: string;
  imageUrl?: string;
}

export interface CreateAdParams {
  adSetId: string;
  name: string;
  creativeId: string;
  status?: MetaAdStatus;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MetaAdsService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // ─── Core request helper ─────────────────────────────────────────────────

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'DELETE',
    params?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set('access_token', this.accessToken);

    const options: RequestInit = { method };

    if (method === 'GET' && params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, String(v));
      }
    }

    if (method === 'POST') {
      options.headers = { 'Content-Type': 'application/json' };
      if (params) options.body = JSON.stringify(params);
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), options);
    } catch (err) {
      throw new Error(
        `Meta API network error: ${err instanceof Error ? err.message : 'Connection failed'}`
      );
    }

    let data: T & { error?: MetaAPIError };
    try {
      data = await response.json();
    } catch {
      throw new Error(`Meta API returned non-JSON response (status: ${response.status})`);
    }

    if (!response.ok || (data as { error?: MetaAPIError }).error) {
      const err = (data as { error?: MetaAPIError }).error;
      throw new Error(
        err
          ? `Meta API error ${err.code}: ${err.message}`
          : `Meta API request failed with status ${response.status}`
      );
    }

    return data;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private parseInsights(raw?: RawInsights): MetaAdInsights | undefined {
    if (!raw) return undefined;
    return {
      impressions: parseInt(raw.impressions ?? '0', 10),
      reach: parseInt(raw.reach ?? '0', 10),
      clicks: parseInt(raw.clicks ?? '0', 10),
      spend: parseFloat(raw.spend ?? '0'),
      cpc: parseFloat(raw.cpc ?? '0'),
      ctr: parseFloat(raw.ctr ?? '0'),
      cpm: raw.cpm ? parseFloat(raw.cpm) : undefined,
      conversions: raw.conversions ? parseInt(raw.conversions, 10) : undefined,
      dateStart: raw.date_start,
      dateStop: raw.date_stop,
    };
  }

  private parseCampaign(raw: RawCampaign): MetaCampaign {
    const insightData = raw.insights?.data?.[0];
    return {
      id: raw.id,
      name: raw.name,
      objective: raw.objective as MetaCampaignObjective,
      status: raw.status as MetaAdStatus,
      dailyBudget: raw.daily_budget ? parseInt(raw.daily_budget, 10) : undefined,
      lifetimeBudget: raw.lifetime_budget ? parseInt(raw.lifetime_budget, 10) : undefined,
      startTime: raw.start_time,
      endTime: raw.stop_time,
      insights: this.parseInsights(insightData),
      createdAt: raw.created_time ?? new Date().toISOString(),
      updatedAt: raw.updated_time ?? new Date().toISOString(),
    };
  }

  private parseAdSet(raw: RawAdSet): MetaAdSet {
    const insightData = raw.insights?.data?.[0];
    return {
      id: raw.id,
      campaignId: raw.campaign_id,
      name: raw.name,
      status: raw.status as MetaAdStatus,
      dailyBudget: parseInt(raw.daily_budget ?? '0', 10),
      billingEvent: raw.billing_event ?? 'IMPRESSIONS',
      optimizationGoal: raw.optimization_goal ?? 'REACH',
      targeting: {
        ageMin: raw.targeting?.age_min ?? 18,
        ageMax: raw.targeting?.age_max ?? 65,
        geoLocations: { countries: raw.targeting?.geo_locations?.countries ?? ['US'] },
        interests: raw.targeting?.flexible_spec?.[0]?.interests,
        genders: raw.targeting?.genders,
      },
      startTime: raw.start_time,
      endTime: raw.end_time,
      insights: this.parseInsights(insightData),
    };
  }

  // ─── Ad Account ───────────────────────────────────────────────────────────

  async getAdAccount(adAccountId: string): Promise<MetaAdAccount> {
    const raw = await this.request<{
      id: string; name: string; currency: string;
      account_status: number; business?: { name: string };
    }>(
      `/act_${adAccountId}`,
      'GET',
      { fields: 'id,name,currency,account_status,business' }
    );
    return {
      id: raw.id,
      name: raw.name,
      currency: raw.currency,
      accountStatus: raw.account_status,
      businessName: raw.business?.name,
    };
  }

  // ─── Campaigns ────────────────────────────────────────────────────────────

  async getCampaigns(adAccountId: string): Promise<MetaCampaign[]> {
    const raw = await this.request<MetaAPIResponse<RawCampaign>>(
      `/act_${adAccountId}/campaigns`,
      'GET',
      {
        fields: 'id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time,insights{impressions,reach,clicks,spend,cpc,ctr}',
        limit: 50,
      }
    );
    return (raw.data ?? []).map((c) => this.parseCampaign(c));
  }

  async createCampaign(adAccountId: string, params: CreateCampaignParams): Promise<MetaCampaign> {
    const body: Record<string, unknown> = {
      name: params.name,
      objective: params.objective,
      status: params.status ?? 'PAUSED',
      special_ad_categories: [],
    };
    if (params.dailyBudget) body.daily_budget = params.dailyBudget;
    if (params.lifetimeBudget) body.lifetime_budget = params.lifetimeBudget;
    if (params.startTime) body.start_time = params.startTime;
    if (params.endTime) body.stop_time = params.endTime;

    const result = await this.request<{ id: string }>(
      `/act_${adAccountId}/campaigns`,
      'POST',
      body
    );

    return {
      id: result.id,
      name: params.name,
      objective: params.objective,
      status: params.status ?? 'PAUSED',
      dailyBudget: params.dailyBudget,
      lifetimeBudget: params.lifetimeBudget,
      startTime: params.startTime,
      endTime: params.endTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateCampaignStatus(campaignId: string, status: MetaAdStatus): Promise<void> {
    await this.request(`/${campaignId}`, 'POST', { status });
  }

  async updateCampaignBudget(campaignId: string, dailyBudget: number): Promise<void> {
    await this.request(`/${campaignId}`, 'POST', { daily_budget: dailyBudget });
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await this.request(`/${campaignId}`, 'DELETE');
  }

  // ─── Campaign Insights ────────────────────────────────────────────────────

  async getCampaignInsights(
    campaignId: string,
    datePreset: MetaDatePreset = 'last_7d'
  ): Promise<MetaAdInsights> {
    const raw = await this.request<MetaAPIResponse<RawInsights>>(
      `/${campaignId}/insights`,
      'GET',
      {
        fields: 'impressions,reach,clicks,spend,cpc,ctr,cpm',
        date_preset: datePreset,
      }
    );
    const d = raw.data?.[0] ?? {};
    return this.parseInsights(d) ?? {
      impressions: 0, reach: 0, clicks: 0, spend: 0, cpc: 0, ctr: 0,
    };
  }

  async getAccountInsights(
    adAccountId: string,
    datePreset: MetaDatePreset = 'last_30d'
  ): Promise<MetaAdInsights> {
    const raw = await this.request<MetaAPIResponse<RawInsights>>(
      `/act_${adAccountId}/insights`,
      'GET',
      {
        fields: 'impressions,reach,clicks,spend,cpc,ctr,cpm',
        date_preset: datePreset,
      }
    );
    const d = raw.data?.[0] ?? {};
    return this.parseInsights(d) ?? {
      impressions: 0, reach: 0, clicks: 0, spend: 0, cpc: 0, ctr: 0,
    };
  }

  // ─── Ad Sets ──────────────────────────────────────────────────────────────

  async getAdSets(campaignId: string): Promise<MetaAdSet[]> {
    const raw = await this.request<MetaAPIResponse<RawAdSet>>(
      `/${campaignId}/adsets`,
      'GET',
      {
        fields: 'id,campaign_id,name,status,daily_budget,billing_event,optimization_goal,targeting,start_time,end_time,insights{impressions,reach,clicks,spend,cpc,ctr}',
        limit: 50,
      }
    );
    return (raw.data ?? []).map((s) => this.parseAdSet(s));
  }

  async createAdSet(adAccountId: string, params: CreateAdSetParams): Promise<MetaAdSet> {
    const body: Record<string, unknown> = {
      campaign_id: params.campaignId,
      name: params.name,
      daily_budget: params.dailyBudget,
      billing_event: params.billingEvent ?? 'IMPRESSIONS',
      optimization_goal: params.optimizationGoal ?? 'REACH',
      targeting: {
        age_min: params.targeting.ageMin,
        age_max: params.targeting.ageMax,
        geo_locations: params.targeting.geoLocations,
        ...(params.targeting.genders && { genders: params.targeting.genders }),
        ...(params.targeting.interests?.length && {
          flexible_spec: [{ interests: params.targeting.interests }],
        }),
      },
      status: params.status ?? 'PAUSED',
    };
    if (params.startTime) body.start_time = params.startTime;
    if (params.endTime) body.end_time = params.endTime;

    const result = await this.request<{ id: string }>(
      `/act_${adAccountId}/adsets`,
      'POST',
      body
    );

    return {
      id: result.id,
      campaignId: params.campaignId,
      name: params.name,
      status: params.status ?? 'PAUSED',
      dailyBudget: params.dailyBudget,
      billingEvent: params.billingEvent ?? 'IMPRESSIONS',
      optimizationGoal: params.optimizationGoal ?? 'REACH',
      targeting: params.targeting,
      startTime: params.startTime,
      endTime: params.endTime,
    };
  }

  async updateAdSetStatus(adSetId: string, status: MetaAdStatus): Promise<void> {
    await this.request(`/${adSetId}`, 'POST', { status });
  }

  // ─── Ad Creatives ─────────────────────────────────────────────────────────

  async createAdCreative(adAccountId: string, params: CreateAdCreativeParams): Promise<MetaAdCreative> {
    const linkData: Record<string, unknown> = {
      message: params.primaryText,
      name: params.headline,
      link: params.linkUrl,
      call_to_action: {
        type: params.callToAction,
        value: { link: params.linkUrl },
      },
    };
    if (params.description) linkData.description = params.description;
    if (params.imageUrl) linkData.picture = params.imageUrl;

    const body = {
      name: params.name,
      object_story_spec: {
        page_id: params.pageId,
        link_data: linkData,
      },
    };

    const result = await this.request<{ id: string }>(
      `/act_${adAccountId}/adcreatives`,
      'POST',
      body
    );

    return {
      id: result.id,
      name: params.name,
      pageId: params.pageId,
      primaryText: params.primaryText,
      headline: params.headline,
      description: params.description,
      callToAction: params.callToAction,
      linkUrl: params.linkUrl,
      imageUrl: params.imageUrl,
    };
  }

  // ─── Ads ─────────────────────────────────────────────────────────────────

  async getAds(adSetId: string): Promise<MetaAd[]> {
    const raw = await this.request<MetaAPIResponse<RawAd>>(
      `/${adSetId}/ads`,
      'GET',
      {
        fields: 'id,adset_id,name,status,creative{id,name,object_story_spec,image_url},created_time,insights{impressions,reach,clicks,spend,cpc,ctr}',
        limit: 50,
      }
    );
    return (raw.data ?? []).map((a) => {
      const insightData = a.insights?.data?.[0];
      return {
        id: a.id,
        adSetId: a.adset_id,
        name: a.name,
        status: a.status as MetaAdStatus,
        creative: {
          id: a.creative?.id ?? '',
          name: '',
          pageId: '',
          primaryText: '',
          headline: '',
          callToAction: 'LEARN_MORE' as MetaAdCTAType,
          linkUrl: '',
        },
        insights: this.parseInsights(insightData),
        createdAt: a.created_time ?? new Date().toISOString(),
      };
    });
  }

  async createAd(adAccountId: string, params: CreateAdParams): Promise<MetaAd> {
    const body = {
      adset_id: params.adSetId,
      name: params.name,
      creative: { creative_id: params.creativeId },
      status: params.status ?? 'PAUSED',
    };

    const result = await this.request<{ id: string }>(
      `/act_${adAccountId}/ads`,
      'POST',
      body
    );

    return {
      id: result.id,
      adSetId: params.adSetId,
      name: params.name,
      status: params.status ?? 'PAUSED',
      creative: {
        id: params.creativeId,
        name: '',
        pageId: '',
        primaryText: '',
        headline: '',
        callToAction: 'LEARN_MORE',
        linkUrl: '',
      },
      createdAt: new Date().toISOString(),
    };
  }

  async updateAdStatus(adId: string, status: MetaAdStatus): Promise<void> {
    await this.request(`/${adId}`, 'POST', { status });
  }

  // ─── Validate token ───────────────────────────────────────────────────────

  async validateToken(): Promise<boolean> {
    try {
      const res = await fetch(
        `${BASE_URL}/me?access_token=${this.accessToken}&fields=id,name`
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}

export function createMetaAdsService(accessToken: string): MetaAdsService {
  return new MetaAdsService(accessToken);
}
