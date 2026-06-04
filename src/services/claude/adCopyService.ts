import {
  BusinessProfile,
  MetaCampaignObjective,
  MetaAdCTAType,
  MetaAdCopyVariant,
} from '@/types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface GenerateAdCopyParams {
  businessProfile: BusinessProfile;
  campaignObjective: MetaCampaignObjective;
  targetAudience: string;
  product: string;
  landingPageUrl?: string;
  numVariants?: number;
  tone?: string;
}

export interface GenerateAudienceSuggestionsParams {
  businessProfile: BusinessProfile;
  campaignObjective: MetaCampaignObjective;
  product: string;
}

export interface AudienceSuggestion {
  name: string;
  ageRange: { min: number; max: number };
  countries: string[];
  interests: string[];
  rationale: string;
  estimatedReach: string;
}

// ─── Ad Copy Service ──────────────────────────────────────────────────────────

export class AdCopyService {
  private apiKey: string;
  private readonly model = 'claude-sonnet-4-6';
  private readonly baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  private async generate(systemPrompt: string, userPrompt: string, maxTokens = 3000): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(`Claude API error ${response.status}: ${err?.error?.message ?? response.statusText}`);
    }

    const data = await response.json() as {
      content?: Array<{ type: string; text: string }>;
    };
    const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
    if (!text) throw new Error('Claude returned an empty response');
    return text;
  }

  private parseJSON<T>(text: string): T {
    const cleaned = text
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]) as T;
      throw new Error(`Failed to parse Claude response as JSON: ${cleaned.slice(0, 200)}`);
    }
  }

  // ─── Generate Ad Copy Variants ──────────────────────────────────────────

  async generateAdCopy(params: GenerateAdCopyParams): Promise<MetaAdCopyVariant[]> {
    const numVariants = params.numVariants ?? 3;
    const objectiveMap: Record<MetaCampaignObjective, string> = {
      OUTCOME_AWARENESS: 'maximize brand awareness and reach as many relevant people as possible',
      OUTCOME_ENGAGEMENT: 'drive likes, comments, shares and meaningful interactions',
      OUTCOME_LEADS: 'capture lead information — make signing up or getting a quote frictionless',
      OUTCOME_SALES: 'drive direct purchases or conversions with strong urgency and value proposition',
      OUTCOME_TRAFFIC: 'get qualified clicks to the website or landing page',
      OUTCOME_APP_PROMOTION: 'drive app installs or in-app actions',
    };

    const ctaOptions: MetaAdCTAType[] = [
      'LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'BOOK_NOW', 'CONTACT_US',
      'DOWNLOAD', 'GET_OFFER', 'APPLY_NOW',
    ];

    const systemPrompt = `You are a world-class Meta (Facebook & Instagram) advertising copywriter with deep expertise in direct response marketing. You write high-converting ad copy that stops the scroll and drives measurable action.

BUSINESS: ${params.businessProfile.businessName}
NICHE: ${params.businessProfile.niche}
DESCRIPTION: ${params.businessProfile.description}
BRAND TONE: ${params.businessProfile.brandVoice.tone.join(', ')}
TARGET AUDIENCE: ${params.businessProfile.targetAudience.primaryDemographic}
PAIN POINTS: ${params.businessProfile.targetAudience.painPoints.join(', ')}
DESIRES: ${params.businessProfile.targetAudience.desires.join(', ')}

Always respond with valid JSON only. No preamble.`;

    const userPrompt = `CAMPAIGN AD COPY REQUEST
═══════════════════════════════════
PRODUCT/OFFER: ${params.product}
CAMPAIGN OBJECTIVE: ${params.campaignObjective} — ${objectiveMap[params.campaignObjective]}
TARGET AUDIENCE: ${params.targetAudience}
${params.landingPageUrl ? `LANDING PAGE: ${params.landingPageUrl}` : ''}
${params.tone ? `REQUIRED TONE: ${params.tone}` : ''}

META AD COPY CONSTRAINTS:
• Headline: max 40 characters (shorter = better — punchy and clear)
• Primary Text: max 125 characters for optimal display (can go longer but first 125 chars must hook)
• Description: max 25 characters (newsfeed only — short supplementary text)
• CTA buttons available: ${ctaOptions.join(', ')}

WHAT MAKES GREAT META AD COPY:
1. Headline must be ultra-specific — numbers, benefits, or questions work best
2. Primary text opens with the audience's pain or desire — not the product features
3. Social proof, urgency, or scarcity increases CTR significantly
4. Speak to ONE person, not a crowd — use "you" language
5. The CTA must match the offer — don't say SHOP_NOW if there's no direct purchase

Generate exactly ${numVariants} distinct ad copy variants. Each must target a different emotional angle:
- Variant 1: Pain/problem-led (highlight the problem this solves)
- Variant 2: Desire/aspiration-led (paint the vision of success)
- Variant 3: Social proof / authority-led (results, stats, credibility)

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "variants": [
    {
      "headline": "Under 40 chars — punchy",
      "primaryText": "Opens with pain/desire. Builds interest. Ends with soft CTA.",
      "description": "Short. Max 25 chars.",
      "callToAction": "LEARN_MORE",
      "whyItWorks": "One sentence explaining the psychological trigger",
      "estimatedCTR": 3.2
    }
  ]
}

estimatedCTR: realistic click-through rate estimate in percent (typical Meta ads: 0.5–3%, great ads: 3–8%).`;

    const text = await this.generate(systemPrompt, userPrompt);
    const parsed = this.parseJSON<{ variants: MetaAdCopyVariant[] }>(text);

    if (!Array.isArray(parsed.variants)) {
      throw new Error('Invalid ad copy response: missing variants array');
    }

    return parsed.variants.slice(0, numVariants);
  }

  // ─── Generate Audience Suggestions ─────────────────────────────────────

  async generateAudienceSuggestions(
    params: GenerateAudienceSuggestionsParams
  ): Promise<AudienceSuggestion[]> {
    const systemPrompt = `You are a Meta Ads targeting specialist who builds high-ROI audience segments. Always respond with valid JSON only.`;

    const userPrompt = `AUDIENCE TARGETING REQUEST
═══════════════════════════════════
BUSINESS: ${params.businessProfile.businessName}
NICHE: ${params.businessProfile.niche}
PRODUCT: ${params.product}
OBJECTIVE: ${params.campaignObjective}
EXISTING AUDIENCE: ${params.businessProfile.targetAudience.primaryDemographic}
PAIN POINTS: ${params.businessProfile.targetAudience.painPoints.join('; ')}

Suggest 3 different Meta audience targeting segments for this campaign. Each should be distinct (different ages, interests, or geographic focus) to enable A/B testing.

Return ONLY valid JSON:
{
  "audiences": [
    {
      "name": "Segment name",
      "ageRange": { "min": 25, "max": 45 },
      "countries": ["US", "CA"],
      "interests": ["Interest 1", "Interest 2", "Interest 3"],
      "rationale": "Why this audience will convert",
      "estimatedReach": "2M–5M people"
    }
  ]
}`;

    const text = await this.generate(systemPrompt, userPrompt, 1500);
    const parsed = this.parseJSON<{ audiences: AudienceSuggestion[] }>(text);
    return parsed.audiences ?? [];
  }

  // ─── Analyse Campaign Performance ────────────────────────────────────────

  async analyzeCampaignPerformance(
    businessProfile: BusinessProfile,
    campaignData: {
      name: string;
      objective: string;
      spend: number;
      impressions: number;
      clicks: number;
      conversions?: number;
      ctr: number;
      cpc: number;
      currency: string;
    }
  ): Promise<string> {
    const systemPrompt = `You are a Meta Ads performance analyst who gives direct, actionable insights. Be concise but specific.`;

    const roas = campaignData.conversions
      ? `ROAS: ${((campaignData.conversions * 50) / campaignData.spend).toFixed(2)}x (estimated)`
      : '';

    const userPrompt = `CAMPAIGN PERFORMANCE ANALYSIS
═══════════════════════════════════
BUSINESS: ${businessProfile.businessName}
CAMPAIGN: ${campaignData.name}
OBJECTIVE: ${campaignData.objective}

METRICS:
• Spend: ${campaignData.currency} ${campaignData.spend.toFixed(2)}
• Impressions: ${campaignData.impressions.toLocaleString()}
• Clicks: ${campaignData.clicks.toLocaleString()}
• CTR: ${campaignData.ctr.toFixed(2)}%
• CPC: ${campaignData.currency} ${campaignData.cpc.toFixed(2)}
${campaignData.conversions ? `• Conversions: ${campaignData.conversions}` : ''}
${roas}

BENCHMARKS (Meta Ads industry average):
• Average CTR: 0.9%
• Average CPC: $0.97
• Good CTR: >1.5%
• Great CTR: >3%

Provide a concise analysis covering:
1. Performance vs. benchmarks (1-2 sentences)
2. Top 2 strengths
3. Top 2 areas to improve with specific actions
4. Immediate recommendation (what to do next)

Keep it under 250 words. Be direct and specific.`;

    return this.generate(systemPrompt, userPrompt, 1000);
  }
}

export function createAdCopyService(apiKey: string): AdCopyService {
  return new AdCopyService(apiKey);
}
