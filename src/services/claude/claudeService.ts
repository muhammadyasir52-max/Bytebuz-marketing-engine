import {
  BusinessProfile,
  SocialPlatform,
  ContentType,
  HookType,
  ContentFramework,
  GeneratedVariant,
  WeeklyStrategy,
  VideoScript,
} from '@/types';
import {
  buildSystemPrompt,
  buildPostPrompt,
  buildVideoScriptPrompt,
  buildStrategyPrompt,
  buildSEOPrompt,
  buildHashtagPrompt,
  buildImagePromptRequest,
} from './promptBuilder';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface GeneratePostParams {
  businessProfile: BusinessProfile;
  platform: SocialPlatform | SocialPlatform[];
  contentType: ContentType;
  hookType: HookType;
  framework: ContentFramework;
  topic?: string;
  wordCount?: number;
  seoKeywords?: string[];
}

export interface GenerateVideoScriptParams {
  businessProfile: BusinessProfile;
  platform: 'tiktok' | 'youtube' | 'instagram';
  durationSeconds: number;
  topic: string;
  targetEmotion?: string;
}

export interface GenerateSEOParams {
  businessProfile: BusinessProfile;
  primaryKeyword: string;
  secondaryKeywords: string[];
  wordCount: number;
  searchIntent: 'informational' | 'transactional' | 'navigational';
}

// ─── Claude Service ───────────────────────────────────────────────────────────

export class ClaudeService {
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

  // ─── Core Streaming Method ────────────────────────────────────────────────

  async generateStream(
    systemPrompt: string,
    userPrompt: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: Error) => void,
    maxTokens = 4096
  ): Promise<void> {
    let response: Response;
    try {
      response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          stream: true,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
    } catch (networkError) {
      onError(
        new Error(
          `Network error: ${networkError instanceof Error ? networkError.message : 'Failed to connect to Claude API'}`
        )
      );
      return;
    }

    if (!response.ok) {
      let errorMessage = `Claude API error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = (await response.json()) as { error?: { message?: string } };
        if (errorBody?.error?.message) {
          errorMessage = `Claude API error ${response.status}: ${errorBody.error.message}`;
        }
      } catch {
        // ignore JSON parse error — use default message
      }
      onError(new Error(errorMessage));
      return;
    }

    if (!response.body) {
      onError(new Error('Claude API returned no response body'));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue; // skip empty lines and SSE comments

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') continue;

            let event: {
              type: string;
              delta?: { type: string; text: string };
              error?: { type: string; message: string };
            };
            try {
              event = JSON.parse(dataStr) as typeof event;
            } catch {
              // skip malformed SSE data
              continue;
            }

            switch (event.type) {
              case 'content_block_delta':
                if (event.delta?.type === 'text_delta' && event.delta.text) {
                  accumulated += event.delta.text;
                  onChunk(event.delta.text);
                }
                break;

              case 'message_stop':
                onComplete(accumulated);
                return;

              case 'error':
                onError(
                  new Error(
                    `Claude API stream error: ${event.error?.message ?? 'Unknown streaming error'}`
                  )
                );
                return;

              // message_start, content_block_start, content_block_stop, message_delta — no action needed
              default:
                break;
            }
          }
        }
      }

      // Stream ended without message_stop (can happen in some edge cases)
      if (accumulated) {
        onComplete(accumulated);
      }
    } catch (readError) {
      onError(
        new Error(
          `Stream reading error: ${readError instanceof Error ? readError.message : 'Unknown error'}`
        )
      );
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // ignore lock release errors
      }
    }
  }

  // ─── Internal: Non-streaming collect helper ───────────────────────────────

  private async generateCollect(
    systemPrompt: string,
    userPrompt: string,
    onChunk?: (text: string) => void,
    maxTokens = 4096
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.generateStream(
        systemPrompt,
        userPrompt,
        (chunk) => {
          if (onChunk) onChunk(chunk);
        },
        (fullText) => resolve(fullText),
        (error) => reject(error),
        maxTokens
      );
    });
  }

  // ─── Parse JSON safely from LLM output ───────────────────────────────────

  private parseJSON<T>(text: string): T {
    // Strip markdown code blocks if present
    const cleaned = text
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim();

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      // Try to extract JSON object from surrounding text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      throw new Error(`Failed to parse Claude response as JSON: ${cleaned.slice(0, 200)}`);
    }
  }

  // ─── Generate Post ────────────────────────────────────────────────────────

  async generatePost(
    params: GeneratePostParams,
    onChunk?: (text: string) => void
  ): Promise<GeneratedVariant[]> {
    const systemPrompt = buildSystemPrompt(params.businessProfile);
    const userPrompt = buildPostPrompt(params);

    const fullText = await this.generateCollect(systemPrompt, userPrompt, onChunk, 4096);

    const parsed = this.parseJSON<{
      variants: Array<{
        hook: string;
        body: string;
        callToAction: string;
        hashtags: string[];
        estimatedEngagementScore?: number;
        whyItWorks?: string;
        platformVariants?: Partial<Record<SocialPlatform, { body: string; hashtags: string[] }>>;
      }>;
    }>(fullText);

    if (!parsed.variants || !Array.isArray(parsed.variants)) {
      throw new Error('Invalid response structure: missing variants array');
    }

    return parsed.variants.map((v) => ({
      hook: v.hook,
      body: v.body,
      callToAction: v.callToAction,
      hashtags: v.hashtags.map((h) => h.replace(/^#/, '')),
      estimatedEngagementScore: v.estimatedEngagementScore ?? 0,
      whyItWorks: v.whyItWorks ?? '',
      platformVariants: v.platformVariants,
    }));
  }

  // ─── Generate Weekly Strategy ─────────────────────────────────────────────

  async generateWeeklyStrategy(businessProfile: BusinessProfile): Promise<WeeklyStrategy> {
    const systemPrompt = buildSystemPrompt(businessProfile);
    const userPrompt = buildStrategyPrompt(businessProfile);

    const fullText = await this.generateCollect(systemPrompt, userPrompt, undefined, 4096);
    const parsed = this.parseJSON<WeeklyStrategy>(fullText);

    if (!parsed.calendarItems || !Array.isArray(parsed.calendarItems)) {
      throw new Error('Invalid strategy response: missing calendarItems array');
    }

    return parsed;
  }

  // ─── Generate Video Script ────────────────────────────────────────────────

  async generateVideoScript(
    params: GenerateVideoScriptParams,
    onChunk?: (text: string) => void
  ): Promise<VideoScript> {
    const systemPrompt = buildSystemPrompt(params.businessProfile);
    const userPrompt = buildVideoScriptPrompt(params);

    const fullText = await this.generateCollect(systemPrompt, userPrompt, onChunk, 4096);

    const parsed = this.parseJSON<{
      hook: string;
      scenes: Array<{
        duration: number;
        visualDescription: string;
        voiceover: string;
        onScreenText?: string;
      }>;
      cta: string;
      totalDurationSeconds: number;
    }>(fullText);

    return {
      hook: parsed.hook,
      scenes: parsed.scenes,
      cta: parsed.cta,
      totalDurationSeconds: parsed.totalDurationSeconds ?? params.durationSeconds,
    };
  }

  // ─── Generate SEO Content ─────────────────────────────────────────────────

  async generateSEOContent(
    params: GenerateSEOParams,
    onChunk?: (text: string) => void
  ): Promise<string> {
    const systemPrompt = buildSystemPrompt(params.businessProfile);
    const userPrompt = buildSEOPrompt(params, params.businessProfile);

    const fullText = await this.generateCollect(
      systemPrompt,
      userPrompt,
      onChunk,
      8192 // SEO articles need more tokens
    );

    return fullText;
  }

  // ─── Generate Hashtags ────────────────────────────────────────────────────

  async generateHashtags(
    content: string,
    platform: SocialPlatform,
    count: number
  ): Promise<string[]> {
    const userPrompt = buildHashtagPrompt(content, platform, count);
    const systemPrompt =
      'You are a social media hashtag research specialist. Always respond with valid JSON only.';

    const fullText = await this.generateCollect(systemPrompt, userPrompt, undefined, 1024);

    const parsed = this.parseJSON<{ hashtags: string[] }>(fullText);
    if (!parsed.hashtags || !Array.isArray(parsed.hashtags)) {
      throw new Error('Invalid hashtag response: missing hashtags array');
    }

    return parsed.hashtags.map((h) => h.replace(/^#/, ''));
  }

  // ─── Generate Image Prompt ────────────────────────────────────────────────

  async generateImagePrompt(postContent: string, brandTone: string[]): Promise<string> {
    const userPrompt = buildImagePromptRequest(postContent, brandTone);
    const systemPrompt =
      'You are an expert AI image prompt engineer and visual designer for social media. Always respond with valid JSON only.';

    const fullText = await this.generateCollect(systemPrompt, userPrompt, undefined, 1024);

    const parsed = this.parseJSON<{ imagePrompt: string }>(fullText);
    if (!parsed.imagePrompt) {
      throw new Error('Invalid image prompt response: missing imagePrompt field');
    }

    return parsed.imagePrompt;
  }

  // ─── Validate API Key ─────────────────────────────────────────────────────

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });

      // 200 = valid, 401 = invalid key, other errors = network/server issue
      if (response.ok) return true;
      if (response.status === 401 || response.status === 403) return false;

      // For other errors (500, 529 etc.), the key may be valid — assume true
      return response.status !== 401 && response.status !== 403;
    } catch {
      // Network error — cannot determine validity
      return false;
    }
  }

  // ─── Analyze Competitor Gap ───────────────────────────────────────────────

  async analyzeCompetitorGap(businessProfile: BusinessProfile): Promise<string> {
    const systemPrompt = buildSystemPrompt(businessProfile);

    const competitorDetails = businessProfile.competitors
      .map(
        (c) =>
          `- @${c.handle} on ${c.platform}: ${c.notes}`
      )
      .join('\n');

    const competitorNames = businessProfile.competitors.map((c) => c.handle).join(', ');

    const userPrompt = `COMPETITIVE GAP ANALYSIS REQUEST

Analyze the competitive landscape for ${businessProfile.businessName} against these competitors: ${competitorNames}

Competitor Details:
${competitorDetails}

Provide a strategic analysis covering:

1. CONTENT GAPS: What content topics or formats are the competitors NOT covering well? Where is there white space for ${businessProfile.businessName} to own?

2. POSITIONING OPPORTUNITIES: Based on competitor notes and ${businessProfile.businessName}'s strengths, what unique positioning angles should be emphasized?

3. PLATFORM OPPORTUNITIES: Which platforms are competitors underutilizing? Where can ${businessProfile.businessName} gain first-mover advantage?

4. MESSAGE DIFFERENTIATION: What messaging angles would clearly differentiate ${businessProfile.businessName} from the competition in the audience's mind?

5. CONTENT STRATEGY RECOMMENDATIONS: 5 specific content strategies that would create a competitive advantage.

6. QUICK WINS: 3 immediate actions ${businessProfile.businessName} can take in the next 30 days to outflank the competition.

Be specific, actionable, and direct. Focus on opportunities, not just observations. Write in second person addressing ${businessProfile.businessName} directly.`;

    const fullText = await this.generateCollect(systemPrompt, userPrompt, undefined, 3000);
    return fullText;
  }
}

// ─── Factory Function ─────────────────────────────────────────────────────────

export function createClaudeService(apiKey: string): ClaudeService {
  return new ClaudeService(apiKey);
}
