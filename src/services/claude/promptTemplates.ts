import { HookType, ContentFramework, SocialPlatform } from '@/types';

// ─── Hook Type Definitions ────────────────────────────────────────────────────

export const HOOK_TYPE_DEFINITIONS: Record<
  HookType,
  { name: string; formula: string; description: string; example: string }
> = {
  controversial_opinion: {
    name: 'Controversial Opinion Hook',
    formula: 'State a bold, polarizing opinion about your industry that most people are afraid to say.',
    description:
      'Opens with a strong, divisive stance on a topic in your niche. Forces readers to engage — either to agree enthusiastically or defend the opposite view. Creates immediate emotional investment and comment-worthy content.',
    example:
      'The [popular belief] is holding [audience] back — and most experts won\'t tell you why.\nHot take: [common industry practice] is actually the worst thing you can do for [goal].',
  },
  surprising_stat: {
    name: 'Surprising Statistic Hook',
    formula: '[Shocking number/percentage] + [what it reveals about the reader\'s world].',
    description:
      'Leads with a striking data point that reframes the reader\'s understanding. Numbers create instant credibility and pattern-interrupt the scroll. The stat must be genuinely surprising, not commonly known.',
    example:
      '73% of [target audience] struggle with [problem] — but almost nobody talks about why.\n$[amount] is left on the table every year by [audience] who don\'t know this strategy.',
  },
  relatable_story: {
    name: 'Relatable Story Hook',
    formula: 'Start mid-scene with a vivid, specific moment that the audience has lived or deeply understands.',
    description:
      'Opens with a specific, authentic narrative moment that the audience immediately recognizes from their own experience. Human brains are wired for story — this hook bypasses resistance and creates emotional investment.',
    example:
      'I was sitting at my desk at [time] wondering why [relatable struggle] — sound familiar?\nIt was [specific moment] when I finally realized I had been doing [thing] completely wrong.',
  },
  how_to: {
    name: 'How-To Hook',
    formula: 'How to [achieve desired outcome] [without undesirable obstacle] [in specific timeframe].',
    description:
      'Promises a specific, actionable outcome. Extremely direct and clear about the value being delivered. Works because it removes ambiguity about what the reader will gain.',
    example:
      'How to [get result] without [common struggle] — even if [objection].\nHow I [achieved goal] in [timeframe] with [specific method] (no [common excuse] needed).',
  },
  listicle: {
    name: 'Listicle Hook',
    formula: '[Number] [things/ways/mistakes/secrets] that [relevant group] need to know about [topic].',
    description:
      'Sets clear expectations with a numbered promise. Lists signal digestibility and create a completion loop in the reader\'s mind — they want to see all N items. Works across every platform.',
    example:
      '5 mistakes that are costing [audience] their [goal] (I made all of them).\n7 things top [professionals] do differently — #4 surprised everyone I\'ve told.',
  },
  question: {
    name: 'Question Hook',
    formula: 'Ask a provocative or relatable question that your audience CANNOT ignore.',
    description:
      'Opens with a question that creates curiosity or addresses a core pain point. Forces mental engagement because readers instinctively answer questions in their head before continuing.',
    example:
      'What if everything you\'ve been told about [topic] is wrong?\nWhat would your [business/life] look like if you could [desired outcome] without [main obstacle]?',
  },
  bold_claim: {
    name: 'Bold Claim Hook',
    formula: 'Make a confident, surprising, or counter-intuitive claim that stops the scroll instantly.',
    description:
      'Opens with an audacious declaration that challenges conventional wisdom or promises a strong opinion. Creates immediate intrigue, signals confidence, and demands that the reader find out if it\'s true.',
    example:
      'Most [professionals] are wasting 80% of their [resource] on the wrong things.\nThe [popular advice] is a myth — and following it is costing you [specific result].',
  },
  pattern_interrupt: {
    name: 'Pattern Interrupt Hook',
    formula: 'Break the expected format, structure, or content norms in a way that stops the eye and mind.',
    description:
      'Uses unexpected formatting, an unconventional opening, or a jarring contrast to jolt the reader out of mindless scrolling. Works at the structural and visual level, not just the content level.',
    example:
      'I quit.\n[Then explain the context]\n\nOr: Three things I\'d never tell a client:\n1. [Unexpected truth]\n2. [Unexpected truth]\n3. [Unexpected truth]',
  },
};

// ─── Framework Definitions ────────────────────────────────────────────────────

export const FRAMEWORK_DEFINITIONS: Record<
  ContentFramework,
  { name: string; description: string; steps: { label: string; instruction: string }[] }
> = {
  AIDA: {
    name: 'AIDA — Attention, Interest, Desire, Action',
    description:
      'Classic direct-response framework. Captures attention, builds interest through relevant info, creates emotional desire, then drives action.',
    steps: [
      {
        label: 'Attention',
        instruction:
          'Open with the hook — a bold claim, question, or statistic that stops the scroll immediately.',
      },
      {
        label: 'Interest',
        instruction:
          'Build relevance by connecting the hook to the reader\'s specific situation, problem, or aspiration. Add a surprising insight or supporting detail.',
      },
      {
        label: 'Desire',
        instruction:
          'Paint the transformation. Show the reader what life looks like with the solution. Use vivid, specific language. Address the emotional benefit, not just the functional one.',
      },
      {
        label: 'Action',
        instruction:
          'End with a single, clear, frictionless CTA. Tell them exactly what to do next and why right now.',
      },
    ],
  },
  PAS: {
    name: 'PAS — Problem, Agitation, Solution',
    description:
      'Empathy-first framework. Identifies the pain, makes it feel urgent, then positions the solution as the relief.',
    steps: [
      {
        label: 'Problem',
        instruction:
          'Name the specific problem your audience faces. Be precise — generic problems create generic engagement.',
      },
      {
        label: 'Agitation',
        instruction:
          'Amplify the pain. Describe the consequences of NOT solving this problem. Make the reader feel the urgency — the hidden costs, the frustration, the missed opportunity.',
      },
      {
        label: 'Solution',
        instruction:
          'Present your solution as the logical, relieving answer to everything just described. Keep it specific and benefit-led.',
      },
    ],
  },
  BAB: {
    name: 'BAB — Before, After, Bridge',
    description:
      'Transformation-focused framework. Shows the contrast between where the audience is now and where they could be, then bridges the gap.',
    steps: [
      {
        label: 'Before',
        instruction:
          'Describe the current painful reality in vivid detail. Make the reader feel truly seen in their struggle.',
      },
      {
        label: 'After',
        instruction:
          'Paint the ideal future state with specificity. What does life look like after the transformation? Use sensory and emotional details.',
      },
      {
        label: 'Bridge',
        instruction:
          'Introduce the method, insight, or offer that takes them from Before to After. This is the "how" — keep it clear and compelling.',
      },
    ],
  },
  PPPP: {
    name: 'PPPP — Picture, Promise, Prove, Push',
    description:
      'Visually-oriented, proof-based framework. Creates a mental image, makes a bold promise, backs it with social proof, then drives urgency.',
    steps: [
      {
        label: 'Picture',
        instruction:
          'Paint a vivid mental image of the desired outcome or scenario. Engage the imagination immediately.',
      },
      {
        label: 'Promise',
        instruction:
          'Make a specific, credible promise tied to that picture. What exactly will you deliver or help them achieve?',
      },
      {
        label: 'Prove',
        instruction:
          'Back the promise with evidence — a result, testimonial, case study, statistic, or demonstration. Eliminate skepticism.',
      },
      {
        label: 'Push',
        instruction:
          'Create urgency or momentum toward action. Why should they act now? What\'s the cost of waiting?',
      },
    ],
  },
};

// ─── Platform-Specific Rules ──────────────────────────────────────────────────

export interface PlatformRule {
  characterLimit: number;
  hashtagStrategy: string;
  tone: string;
  formattingNotes: string;
  contentGuidelines: string;
  bestPractices: string[];
}

export const PLATFORM_SPECIFIC_RULES: Record<SocialPlatform, PlatformRule> = {
  instagram: {
    characterLimit: 2200,
    hashtagStrategy:
      'Place 3–5 hashtags inline near end of caption OR add 20–30 hashtags in first comment. Mix: 3 broad (1M+), 5 medium (100K–1M), 12 niche (<100K).',
    tone:
      'Visual-first, aspirational, authentic. Instagram rewards storytelling, aesthetic consistency, and emotional resonance. Mix polished and "real" content.',
    formattingNotes:
      'Use line breaks to create white space. Bold or caps for emphasis (no markdown). Emojis used as bullet points or visual breaks. First line is critical — only first 125 chars visible before "more".',
    contentGuidelines:
      'Lead with the strongest line. Use micro-stories. End captions with a question or CTA to drive comments. Carousel posts outperform single images for saves.',
    bestPractices: [
      'First 125 characters must hook completely',
      'Use emojis as visual separators between paragraphs',
      'End with a clear question to boost comment rate',
      'Save-worthy content (tips, lists) performs best for reach',
      'Avoid external links in caption — use bio link instead',
    ],
  },
  facebook: {
    characterLimit: 63206,
    hashtagStrategy:
      'Use 1–3 targeted hashtags only. Facebook hashtags have minimal discovery impact — focus on shareable storytelling instead.',
    tone:
      'Community-focused, conversational, shareable. Facebook rewards content people want to share with their network. Think: "Would someone forward this email to a friend?"',
    formattingNotes:
      'Longer posts (400–500 words) can outperform short posts if the story is compelling. Use paragraph breaks. No markdown — write in plain text. "See More" appears after ~477 characters.',
    contentGuidelines:
      'Facebook algorithm heavily rewards shares and meaningful comments. Create content that sparks discussion or is deeply relatable/shareable. Videos auto-play — hook in first 3 seconds.',
    bestPractices: [
      'Ask questions that spark debate or personal reflection',
      'Share personal stories with a universal takeaway',
      'Native video outperforms YouTube links significantly',
      'Group-share content (community, family, business owners)',
      'Avoid "engagement bait" phrases (like, share, comment)',
    ],
  },
  linkedin: {
    characterLimit: 3000,
    hashtagStrategy:
      'Use 3–5 professional hashtags. Place at the very end of the post. Mix industry (#Marketing), niche (#ContentStrategy), and personal brand (#Entrepreneurship) hashtags.',
    tone:
      'Professional yet personal, insight-driven, thought leadership. LinkedIn rewards vulnerability + expertise. Share lessons learned, contrarian takes on industry topics, and career/business insights.',
    formattingNotes:
      'Line breaks are critical — one idea per line creates "LinkedIn formatting" that gets more clicks. Use bold sparingly via Unicode if needed. First 210 characters shown before "see more" on mobile.',
    contentGuidelines:
      'Hook must be professional yet scroll-stopping. Personal stories with professional lessons outperform pure promotional content 3:1. Native documents (carousels) get 3–5x more reach than link posts.',
    bestPractices: [
      'First line must stand alone as a compelling hook',
      'Short lines (1–2 sentences max per paragraph)',
      'Personal vulnerability + professional insight is the winning combo',
      'Native documents (PDF carousels) massively outperform links',
      'Comment on your own post with additional insights to boost reach',
      'Tag relevant people sparingly and only if genuinely relevant',
    ],
  },
  twitter: {
    characterLimit: 280,
    hashtagStrategy:
      'Use 1–2 hashtags maximum. Twitter has essentially deprecated hashtag discovery — write for the algorithm, not the hashtag. Use when participating in a trending conversation only.',
    tone:
      'Concise, punchy, opinionated. Twitter rewards hot takes, wit, and intellectual brevity. Every word must earn its place. Contrarian opinions and strong points of view perform best.',
    formattingNotes:
      'Single tweet: 280 chars max. Thread format for long-form (start with hook tweet, number subsequent tweets 2/, 3/ etc). No markdown. Whitespace between paragraphs in threads.',
    contentGuidelines:
      'Threads (7–15 tweets) perform extremely well for thought leadership. The hook tweet determines whether anyone reads the thread. Reposts/QRTs with commentary boost reach.',
    bestPractices: [
      'Every tweet must be valuable as a standalone piece',
      'Threads: make each tweet end with a reason to read the next',
      'Strong opinions expressed confidently outperform neutral takes',
      'Reply to trending topics in your niche with genuine insight',
      'Lists and numbered points get more bookmarks (saves)',
    ],
  },
  tiktok: {
    characterLimit: 2200,
    hashtagStrategy:
      'Use 3–5 hashtags: 1 mega (#ForYou, #viral), 2 niche-specific, 1–2 topic-specific. TikTok SEO is increasingly important — use keywords in captions.',
    tone:
      'Authentic, entertaining, educational (edutainment). TikTok rewards genuine personality, entertainment value, and quick-hitting valuable content. Be yourself but optimized.',
    formattingNotes:
      'Caption supports the video — keep it short (1–3 lines) with a hook or CTA. The video IS the content. Use keywords naturally in caption for SEO. Emojis encouraged.',
    contentGuidelines:
      'First 1–3 seconds of video are make-or-break. Hook must be in the video itself. Caption reinforces the hook. Use trending sounds/formats when relevant. Authenticity > production value.',
    bestPractices: [
      'Caption should tease more than it reveals (drives viewers to watch)',
      'Include relevant keywords for TikTok search (it\'s now a search engine)',
      'Use trending audio when it fits naturally',
      'End with a clear question or CTA to drive comments',
      'Stitch/duet opportunities increase reach',
    ],
  },
  youtube: {
    characterLimit: 5000,
    hashtagStrategy:
      'Add 3 hashtags in description — they appear above the title. Use: 1 branded hashtag, 1 topic hashtag, 1 niche hashtag. Keyword-optimize the full description.',
    tone:
      'Educational, comprehensive, authoritative. YouTube rewards depth and watch time. Viewers expect to learn something meaningful. Position as the definitive resource on the topic.',
    formattingNotes:
      'Description: keyword-rich first 2–3 lines (shown in search results). Add chapters with timestamps. Include relevant links. Full keyword optimization critical for YouTube SEO.',
    contentGuidelines:
      'YouTube description must serve dual purpose: human-readable summary AND keyword-rich SEO text. Include primary keyword in first sentence. Chapters dramatically improve watch time retention.',
    bestPractices: [
      'First 2 lines of description appear in search — make them keyword-rich',
      'Include timestamps/chapters for videos over 5 minutes',
      'Add relevant links (website, related videos, social)',
      'Place keywords naturally — avoid stuffing',
      'Subscribe CTA and link in first paragraph',
    ],
  },
};

// ─── Video Virality Rules ─────────────────────────────────────────────────────

export interface VideoViralityRule {
  hookWindow: string;
  retentionStrategy: string;
  ctaPlacement: string;
  formatTips: string[];
  scriptRhythm: string;
}

export const VIDEO_VIRALITY_RULES: Record<'tiktok' | 'youtube' | 'instagram', VideoViralityRule> =
  {
    tiktok: {
      hookWindow:
        'First 1–3 seconds are critical. Open mid-action, with a bold statement, or with a visual pattern interrupt. NO slow intros.',
      retentionStrategy:
        'Pace: one new idea or visual change every 2–3 seconds. Use "open loops" (tease what\'s coming) to prevent drop-off. Cut dead air ruthlessly.',
      ctaPlacement:
        'CTA at 80–90% through the video, just before the natural ending. "Follow for more [specific value]" outperforms generic CTAs.',
      formatTips: [
        'Vertical 9:16 format only',
        'On-screen text for key points (many watch without sound)',
        'Jump cuts every 2–4 seconds keep energy high',
        'B-roll or visual variety every 5–7 seconds',
        'Trending sounds boost algorithmic distribution',
        'Caption/subtitle every video — huge for accessibility and reach',
      ],
      scriptRhythm:
        'Hook (1–3s) → Tension builder (3–10s) → Value delivery in rapid fire (10–45s) → Reframe/twist (45–55s) → CTA (last 5s)',
    },
    youtube: {
      hookWindow:
        'First 30 seconds must hook AND preview full video value. Tell viewers EXACTLY what they\'ll learn and why it matters. No fluff — get to the point.',
      retentionStrategy:
        'Pattern interrupts every 90–120 seconds. Preview upcoming sections ("and in a minute I\'ll show you..."). Use B-roll to illustrate concepts. Chapters help retention significantly.',
      ctaPlacement:
        'Subscribe CTA at 30–60 second mark (after hook is set). End screen CTAs with related video at 80–90%. Mid-video CTA for lead magnets at natural content break.',
      formatTips: [
        'Horizontal 16:9 for standard YouTube',
        'Vertical 9:16 for YouTube Shorts',
        'Chapter markers every 2–4 minutes for long-form',
        'Open loop in intro — promise payoff that comes later',
        'Pattern interrupt: switch camera angles, add B-roll, change scenes',
        'End with a strong recommendation to a related video',
      ],
      scriptRhythm:
        'Hook + Problem statement (0–30s) → Promise what they\'ll learn (30–60s) → Credential/trust building (60–90s) → Main content delivery with chapters → Summary + CTA (final 60–90s)',
    },
    instagram: {
      hookWindow:
        'First 1–2 seconds for Reels. Open with movement, text on screen, or a bold spoken statement. Thumbnail must be compelling for feed posts.',
      retentionStrategy:
        'Keep Reels to 15–30 seconds for maximum reach. For longer Reels (60–90s), use rapid transitions. Every 10 seconds must deliver new value or maintain tension.',
      ctaPlacement:
        'Verbal CTA at 80% of video. Caption CTA for engagement. Story swipe-up or link in bio for conversions.',
      formatTips: [
        'Vertical 9:16 for Reels — non-negotiable',
        'Square 1:1 or 4:5 portrait for feed videos',
        'Bold text overlays for key points (silent autoplay)',
        'First frame as "thumbnail" — must work as a still image',
        'Use trending audio for Reels to boost distribution',
        'Closed captions always — Instagram auto-captions have high adoption',
      ],
      scriptRhythm:
        'Hook (1–2s) → Problem/tension (2–8s) → Value delivery in tight segments (8–25s) → CTA (25–30s). For 60s+: add an extended "proof" or story section at 25–45s.',
    },
  };
