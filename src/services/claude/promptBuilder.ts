import {
  BusinessProfile,
  SocialPlatform,
} from '@/types';
import { GeneratePostParams, GenerateVideoScriptParams, GenerateSEOParams } from './claudeService';
import {
  HOOK_TYPE_DEFINITIONS,
  FRAMEWORK_DEFINITIONS,
  PLATFORM_SPECIFIC_RULES,
  VIDEO_VIRALITY_RULES,
} from './promptTemplates';

// ─── System Prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(profile: BusinessProfile): string {
  const emojiPolicy =
    profile.brandVoice.emojiUsage === 'none'
      ? 'Do NOT use any emojis whatsoever.'
      : profile.brandVoice.emojiUsage === 'minimal'
      ? 'Use emojis very sparingly — maximum 1–2 per post, only when they add genuine value.'
      : profile.brandVoice.emojiUsage === 'moderate'
      ? 'Use emojis moderately — 3–5 per post as visual accents and separators.'
      : 'Use emojis liberally and expressively throughout the content.';

  const platformList =
    profile.activePlatforms.length > 0
      ? profile.activePlatforms.join(', ')
      : 'all major social platforms';

  const competitorSection =
    profile.competitors.length > 0
      ? profile.competitors
          .map(
            (c) =>
              `  - @${c.handle} on ${c.platform}: ${c.notes}`
          )
          .join('\n')
      : '  None specified.';

  const goalsSection =
    profile.goals.length > 0
      ? profile.goals
          .map(
            (g) =>
              `  - ${g.type.replace(/_/g, ' ').toUpperCase()}: ${g.description}${
                g.kpiTarget ? ` (Target: ${g.kpiTarget})` : ''
              }`
          )
          .join('\n')
      : '  General business growth and audience engagement.';

  const painPointsList =
    profile.targetAudience.painPoints.length > 0
      ? profile.targetAudience.painPoints.map((p) => `    • ${p}`).join('\n')
      : '    • Not specified';

  const desiresList =
    profile.targetAudience.desires.length > 0
      ? profile.targetAudience.desires.map((d) => `    • ${d}`).join('\n')
      : '    • Not specified';

  const toneList =
    profile.brandVoice.tone.length > 0 ? profile.brandVoice.tone.join(', ') : 'professional';

  const wordsToAvoid =
    profile.brandVoice.wordsToAvoid.length > 0
      ? profile.brandVoice.wordsToAvoid.join(', ')
      : 'none specified';

  const exampleContentSection =
    profile.brandVoice.exampleContent && profile.brandVoice.exampleContent.length > 0
      ? `\nExample content that exemplifies the brand voice:\n${profile.brandVoice.exampleContent
          .map((e) => `  ---\n  ${e}\n  ---`)
          .join('\n')}`
      : '';

  const websiteSection = profile.websiteUrl
    ? `\nWebsite: ${profile.websiteUrl}`
    : '';

  return `You are an elite social media marketing strategist and copywriter working for ${profile.businessName}.

═══════════════════════════════════════════════
BUSINESS CONTEXT
═══════════════════════════════════════════════

Business Name: ${profile.businessName}
Niche/Industry: ${profile.niche}
Description: ${profile.description}${websiteSection}
Active Platforms: ${platformList}

═══════════════════════════════════════════════
TARGET AUDIENCE
═══════════════════════════════════════════════

Demographics: ${profile.targetAudience.primaryDemographic}

Core Pain Points:
${painPointsList}

Deep Desires & Aspirations:
${desiresList}

Job To Be Done: ${profile.targetAudience.jobToBeDone}

═══════════════════════════════════════════════
BRAND VOICE & STYLE
═══════════════════════════════════════════════

Tone: ${toneList}
Writing Style: ${profile.brandVoice.writingStyle}
Emoji Policy: ${emojiPolicy}
Words/Phrases to NEVER Use: ${wordsToAvoid}${exampleContentSection}

═══════════════════════════════════════════════
COMPETITIVE LANDSCAPE
═══════════════════════════════════════════════

Key Competitors & Notes:
${competitorSection}

${profile.businessName}'s Unique Positioning: Position ALL content to emphasize what makes ${profile.businessName} different and better than the competition above.

═══════════════════════════════════════════════
BUSINESS GOALS & KPIs
═══════════════════════════════════════════════

${goalsSection}

═══════════════════════════════════════════════
CONTENT EXCELLENCE STANDARDS
═══════════════════════════════════════════════

Every piece of content you create must:
1. STOP THE SCROLL — The hook must create an immediate pattern interrupt
2. SPEAK DIRECTLY to the target audience's specific pain points and desires
3. DELIVER GENUINE VALUE — Educate, entertain, or inspire with substance
4. MAINTAIN BRAND VOICE — Consistent with the defined tone and style
5. DRIVE MEASURABLE ACTION — Every post has a clear, single CTA
6. FEEL NATIVE — Content must feel organic to each platform, not cross-posted
7. BE DISTINCTLY ${profile.businessName.toUpperCase()} — Reinforce the unique positioning
8. AVOID CLICHÉS — No generic marketing speak, no vague promises
9. BE SPECIFIC — Specific details beat vague generalities every time
10. CREATE EMOTIONAL RESONANCE — Connect at the emotional level before the logical one

You understand that great social media content is not about promoting a business — it's about creating genuine value for the audience while building trust and authority for ${profile.businessName}. The brand's commercial goals are achieved as a byproduct of exceptional content, not the primary objective.`;
}

// ─── Post Generation Prompt ───────────────────────────────────────────────────

export function buildPostPrompt(params: GeneratePostParams): string {
  const platforms = Array.isArray(params.platform) ? params.platform : [params.platform];
  const hookDef = HOOK_TYPE_DEFINITIONS[params.hookType];
  const frameworkDef = FRAMEWORK_DEFINITIONS[params.framework];

  const platformRules = platforms
    .map((p) => {
      const rules = PLATFORM_SPECIFIC_RULES[p];
      return `### ${p.toUpperCase()}
- Character Limit: ${rules.characterLimit}
- Tone & Style: ${rules.tone}
- Formatting: ${rules.formattingNotes}
- Hashtag Strategy: ${rules.hashtagStrategy}
- Content Guidelines: ${rules.contentGuidelines}
- Best Practices:
${rules.bestPractices.map((bp) => `  • ${bp}`).join('\n')}`;
    })
    .join('\n\n');

  const frameworkSteps = frameworkDef.steps
    .map((step, i) => `  Step ${i + 1} — ${step.label}: ${step.instruction}`)
    .join('\n');

  const topicInstruction = params.topic
    ? `\nSpecific Topic/Angle to Cover: "${params.topic}"`
    : '\nChoose the most compelling topic/angle based on the business context and audience pain points.';

  const wordCountInstruction = params.wordCount
    ? `\nTarget Word Count: approximately ${params.wordCount} words per variant`
    : '';

  const seoSection =
    params.seoKeywords && params.seoKeywords.length > 0
      ? `\n\nSEO & DISCOVERABILITY REQUIREMENTS:
Naturally weave these keywords into the content (do not force them, must read naturally):
${params.seoKeywords.map((k) => `• ${k}`).join('\n')}
At least 2–3 keywords should appear in the hook or first paragraph.`
      : '';

  const contentTypeGuidance: Record<string, string> = {
    text_post:
      'Create a compelling text-only post optimized for reading engagement and sharing.',
    carousel:
      'Write content designed for a carousel format — each section should be a slide. Lead with a powerful cover slide hook.',
    image_post:
      'Write a caption that complements a strong visual. The image does the heavy lifting; the caption provides context and CTA.',
    video_script:
      'Write content structured for video delivery — natural spoken language, clear pacing, strong visual hooks.',
    story:
      'Create short, punchy content for story format — immediate engagement, tap-friendly structure, strong first frame.',
    thread:
      'Structure as a multi-part thread — each segment delivers standalone value but creates a reason to keep reading.',
    seo_article:
      'Create keyword-optimized, comprehensive content that serves search intent while maintaining brand voice.',
    reel_script:
      'Write a high-energy, fast-paced script for a short-form vertical video. Hook in the first 3 seconds is critical.',
  };

  const contentTypeGuide =
    contentTypeGuidance[params.contentType] ||
    'Create compelling content appropriate for the content type.';

  return `CONTENT GENERATION REQUEST
══════════════════════════════════════════════════

TARGET PLATFORM(S): ${platforms.map((p) => p.toUpperCase()).join(', ')}
CONTENT TYPE: ${params.contentType.replace(/_/g, ' ').toUpperCase()}${topicInstruction}${wordCountInstruction}

CONTENT TYPE GUIDANCE:
${contentTypeGuide}

══════════════════════════════════════════════════
HOOK TYPE: ${hookDef.name}
══════════════════════════════════════════════════

Definition: ${hookDef.description}
Formula: ${hookDef.formula}

Hook Examples (adapt these patterns, DO NOT copy verbatim):
${hookDef.example}

Your hook MUST:
• Create immediate pattern interrupt within the first 5–10 words
• Speak directly to the target audience's pain points or desires
• Create irresistible curiosity or make a bold claim that demands attention
• Feel fresh and original — not like a generic marketing hook

══════════════════════════════════════════════════
CONTENT FRAMEWORK: ${frameworkDef.name}
══════════════════════════════════════════════════

${frameworkDef.description}

Structure your body content EXACTLY following these steps:
${frameworkSteps}

══════════════════════════════════════════════════
PLATFORM RULES
══════════════════════════════════════════════════

${platformRules}

══════════════════════════════════════════════════
VIRALITY REQUIREMENTS
══════════════════════════════════════════════════

Each variant MUST include:
✓ A PATTERN INTERRUPT: Something visually or intellectually unexpected in the opening
✓ A COUNTERINTUITIVE IDEA: Challenge at least one assumption your audience holds
✓ SPECIFICITY: Concrete details, numbers, or examples (not vague generalities)
✓ EMOTIONAL RESONANCE: Connect at the feeling level before the logical level
✓ PLATFORM-NATIVE FORMATTING: Feels organic to the platform, not cross-posted
✓ CLEAR SINGLE CTA: One specific, frictionless action for the reader to take
✓ SHAREABLE VALUE: Would the reader share this? If not, revise until they would${seoSection}

══════════════════════════════════════════════════
OUTPUT FORMAT — CRITICAL
══════════════════════════════════════════════════

You MUST respond with ONLY valid JSON. No preamble, no explanation, no markdown code blocks.
Return exactly 3 variants with this structure:

{
  "variants": [
    {
      "hook": "The complete opening hook text",
      "body": "The complete body content following the ${params.framework} framework",
      "callToAction": "The specific call-to-action",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
      "estimatedEngagementScore": 85,
      "whyItWorks": "One sentence explaining what makes this variant effective and unique"
    },
    {
      "hook": "...",
      "body": "...",
      "callToAction": "...",
      "hashtags": [],
      "estimatedEngagementScore": 80,
      "whyItWorks": "..."
    },
    {
      "hook": "...",
      "body": "...",
      "callToAction": "...",
      "hashtags": [],
      "estimatedEngagementScore": 78,
      "whyItWorks": "..."
    }
  ]
}

VARIANT DIFFERENTIATION REQUIREMENTS:
- Variant 1: Lead with the hook as specified — this is the "safe but strong" version
- Variant 2: More provocative/contrarian angle — pushes boundaries while staying on-brand
- Variant 3: Most unique/experimental approach — pattern interrupt with a fresh structure or surprising angle

Each variant must be substantively different — different hooks, different body angles, different CTAs. They should NOT be minor rewrites of each other.

estimatedEngagementScore: Rate each variant from 1–100 based on estimated engagement potential (scroll-stopping power + value delivery + CTA clarity).

hashtags: Include WITHOUT the # symbol. The formatter will add them.`;
}

// ─── Video Script Prompt ──────────────────────────────────────────────────────

export function buildVideoScriptPrompt(params: GenerateVideoScriptParams): string {
  const viralityRules = VIDEO_VIRALITY_RULES[params.platform];
  const platformRules = PLATFORM_SPECIFIC_RULES[params.platform as SocialPlatform];

  const emotionGuidance = params.targetEmotion
    ? `\nTarget Emotion to Evoke: ${params.targetEmotion}\nEvery section of the script should build toward or reinforce this emotional state.`
    : '';

  const sceneCount = Math.max(2, Math.round(params.durationSeconds / 15));
  const avgSceneDuration = Math.round(params.durationSeconds / (sceneCount + 2)); // +2 for hook + cta

  return `VIDEO SCRIPT GENERATION REQUEST
══════════════════════════════════════════════════

Platform: ${params.platform.toUpperCase()}
Duration: ${params.durationSeconds} seconds
Topic: "${params.topic}"${emotionGuidance}

PLATFORM VIRALITY RULES FOR ${params.platform.toUpperCase()}:
• Hook Window: ${viralityRules.hookWindow}
• Retention Strategy: ${viralityRules.retentionStrategy}
• CTA Placement: ${viralityRules.ctaPlacement}
• Script Rhythm: ${viralityRules.scriptRhythm}

Format Tips:
${viralityRules.formatTips.map((t) => `• ${t}`).join('\n')}

SCRIPT REQUIREMENTS:
• Total duration must fit within ${params.durationSeconds} seconds
• Speaking pace: ~150 words per minute for natural delivery
• Estimated word budget: ${Math.round((params.durationSeconds / 60) * 150)} words for spoken content
• Hook must create compelling reason to keep watching in the first ${params.platform === 'youtube' ? '30 seconds' : '3 seconds'}
• Include specific visual direction for each scene (b-roll, text overlays, transitions)
• Each scene delivers exactly ONE clear, valuable idea
• CTA must be specific and frictionless
• Approximate scene duration: ~${avgSceneDuration} seconds each

OUTPUT FORMAT — Return ONLY valid JSON:

{
  "hook": "Word-for-word script for the hook section (first ${params.platform === 'youtube' ? '15–30' : '2–3'} seconds)",
  "scenes": [
    {
      "duration": ${avgSceneDuration},
      "visualDescription": "Specific b-roll or visual direction for this scene",
      "voiceover": "Word-for-word spoken script for this scene",
      "onScreenText": "Optional text overlay for this scene"
    }
  ],
  "cta": "Word-for-word call to action script",
  "totalDurationSeconds": ${params.durationSeconds}
}

Generate ${sceneCount} scenes in the scenes array. Each scene must have a duration that makes the total approximately ${params.durationSeconds} seconds.`;
}

// ─── Weekly Strategy Prompt ───────────────────────────────────────────────────

export function buildStrategyPrompt(
  profile: BusinessProfile,
  analyticsSnapshot?: string
): string {
  const platformList = profile.activePlatforms.join(', ');
  const analyticsSection = analyticsSnapshot
    ? `\n\nCURRENT ANALYTICS SNAPSHOT:\n${analyticsSnapshot}\n\nFactor this performance data into your strategy recommendations.`
    : '';

  const goalsForStrategy = profile.goals
    .slice(0, 3)
    .map((g) => `• ${g.type.replace(/_/g, ' ')}: ${g.description}`)
    .join('\n');

  return `WEEKLY CONTENT STRATEGY REQUEST
══════════════════════════════════════════════════

Active Platforms: ${platformList}
Primary Business Goals:
${goalsForStrategy}${analyticsSection}

Generate a comprehensive 7-day content strategy calendar that:
1. Balances content types for sustainable audience growth
2. Maximizes platform-specific algorithmic advantages
3. Creates a cohesive narrative arc across the week
4. Directly serves the stated business goals
5. Maintains brand voice consistency

OUTPUT FORMAT — Return ONLY valid JSON:

{
  "focusTheme": "Overarching theme that ties the week together",
  "boldMove": "One big, bold strategy move for this week that could significantly accelerate growth",
  "generatedAt": "${new Date().toISOString()}",
  "calendarItems": [
    {
      "day": "Monday",
      "platform": "${profile.activePlatforms[0] || 'instagram'}",
      "contentType": "text_post",
      "topic": "Specific topic idea for this post",
      "suggestedTime": "09:00"
    }
  ],
  "insights": [
    {
      "id": "insight-1",
      "insight": "Key insight about the audience or market this week",
      "recommendation": "Specific action based on this insight"
    }
  ],
  "actionItems": [
    {
      "id": "action-1",
      "title": "Action item title",
      "description": "What to do and how",
      "impact": "high",
      "completed": false
    }
  ]
}

STRATEGY REQUIREMENTS:
• Include at least one post for each active platform: ${platformList}
• Schedule 5–7 posts across the week
• suggestedTime should be platform-optimized
• Ensure 70% value content, 20% engagement content, 10% promotional content
• Include 3 insights and 5 actionItems`;
}

// ─── SEO Content Prompt ───────────────────────────────────────────────────────

export function buildSEOPrompt(params: GenerateSEOParams, profile: BusinessProfile): string {
  const intentDescriptions: Record<string, string> = {
    informational:
      'The reader wants to learn. Optimize for educational depth, comprehensive coverage, and trust-building. This content positions the business as an authority.',
    transactional:
      'The reader is ready to buy or take action. Optimize for conversion. Include compelling CTAs, address buying objections, and highlight value propositions.',
    navigational:
      'The reader is looking for a specific resource or comparison. Optimize for clarity, structured information, and easy scanning.',
  };

  const secondaryKeywordsSection =
    params.secondaryKeywords.length > 0
      ? `Secondary Keywords (use each 1–3 times naturally): ${params.secondaryKeywords.join(', ')}`
      : '';

  return `SEO CONTENT GENERATION REQUEST
══════════════════════════════════════════════════

Primary Keyword: "${params.primaryKeyword}"
${secondaryKeywordsSection}
Target Word Count: ${params.wordCount} words
Search Intent: ${params.searchIntent.toUpperCase()} — ${intentDescriptions[params.searchIntent]}

CONTENT STRUCTURE REQUIREMENTS:
• H1: Include primary keyword, compelling and click-worthy
• Meta description: 150–160 characters, include primary keyword, compelling CTA
• Introduction: Hook in first 2 sentences, primary keyword in first 100 words
• Subheadings (H2/H3): Use secondary keywords naturally in at least 2–3 subheadings
• Body: Comprehensive coverage of the topic, deeply valuable to the reader
• Conclusion: Summarize key points, include CTA aligned with business goals

SEO REQUIREMENTS:
• Primary keyword density: 1–2% (approximately ${Math.round(params.wordCount * 0.015)} uses)
• Include semantic variations of the primary keyword
• Add internal linking suggestions (note with [INTERNAL LINK: topic])
• Include 1–2 outbound authority link suggestions (note with [EXTERNAL LINK: topic])
• Optimize for featured snippets where relevant (use definition boxes, numbered lists)

BRAND VOICE:
Maintain ${profile.businessName}'s brand voice throughout: ${profile.brandVoice.tone.join(', ')} tone with ${profile.brandVoice.writingStyle} writing style.

OUTPUT: Return the complete SEO article as plain text with proper HTML heading tags (h1, h2, h3). Include meta title and meta description at the top preceded by META_TITLE: and META_DESC: labels. Write the full ${params.wordCount}-word article — do not truncate.`;
}

// ─── Hashtag Generation Prompt ────────────────────────────────────────────────

export function buildHashtagPrompt(
  content: string,
  platform: SocialPlatform,
  count: number
): string {
  const platformRules = PLATFORM_SPECIFIC_RULES[platform];

  return `HASHTAG GENERATION REQUEST
══════════════════════════════════════════════════

Platform: ${platform.toUpperCase()}
Required Count: ${count} hashtags
Platform Hashtag Strategy: ${platformRules.hashtagStrategy}

CONTENT TO GENERATE HASHTAGS FOR:
"${content.slice(0, 500)}${content.length > 500 ? '...' : ''}"

HASHTAG REQUIREMENTS:
1. Research-based: Select hashtags that have real search/discovery value on ${platform}
2. Mix strategy:
   - ${Math.ceil(count * 0.15)} broad hashtags (1M+ posts) — maximum reach
   - ${Math.ceil(count * 0.40)} medium hashtags (100K–1M posts) — balanced reach/competition
   - ${Math.floor(count * 0.45)} niche hashtags (<100K posts) — highly targeted, easier to rank
3. All hashtags must be directly relevant to the content, brand, or audience
4. No banned or restricted hashtags
5. Mix: topic-based, industry-based, audience-based, and brand-adjacent hashtags

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Return exactly ${count} hashtags WITHOUT the # symbol. Do not include any other text.`;
}

// ─── Image Prompt Request ─────────────────────────────────────────────────────

export function buildImagePromptRequest(content: string, tones: string[]): string {
  const toneDescription = tones.join(', ');

  return `IMAGE PROMPT GENERATION REQUEST
══════════════════════════════════════════════════

POST CONTENT:
"${content.slice(0, 600)}${content.length > 600 ? '...' : ''}"

BRAND TONE: ${toneDescription}

Generate a detailed, platform-optimized image generation prompt for this social media post.

The image prompt must:
1. Be specific enough for an AI image generator (Midjourney, DALL-E, Stable Diffusion) to create exactly what's needed
2. Align with the post's message and emotional tone
3. Include: subject description, composition/framing, lighting, color palette, mood/atmosphere, style reference
4. Be optimized for social media (visually striking, thumb-stopping)
5. Include aspect ratio recommendation (1:1 for Instagram feed, 9:16 for Stories/TikTok/Reels, 16:9 for YouTube)
6. Specify if it should be photography or illustration style

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "imagePrompt": "Full detailed prompt for the AI image generator",
  "aspectRatio": "1:1",
  "style": "photography",
  "colorPalette": ["#color1", "#color2", "#color3"],
  "mood": "Brief mood description"
}`;
}
