import { SocialPlatform, ContentFramework, BrandTone } from '@/types';

// ─── Character Limits ─────────────────────────────────────────────────────────

export const CHARACTER_LIMITS: Record<SocialPlatform, number> = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  twitter: 280,
  tiktok: 2200,
  youtube: 5000,
};

// ─── Hashtag Limits ───────────────────────────────────────────────────────────

export const HASHTAG_LIMITS: Record<SocialPlatform, number> = {
  instagram: 30,
  facebook: 10,
  linkedin: 5,
  twitter: 2,
  tiktok: 20,
  youtube: 15,
};

// ─── Posting Frequency Options ────────────────────────────────────────────────

export const POSTING_FREQUENCY_OPTIONS = [
  {
    id: 'daily' as const,
    label: 'Daily',
    description: '7 posts per week — maximum visibility',
    postsPerWeek: 7,
    recommendedFor: ['brand awareness', 'community building', 'new accounts'],
  },
  {
    id: '3x_week' as const,
    label: '3× per Week',
    description: '3 posts per week — balanced growth',
    postsPerWeek: 3,
    recommendedFor: ['lead generation', 'engagement', 'most businesses'],
  },
  {
    id: '2x_week' as const,
    label: '2× per Week',
    description: '2 posts per week — quality focus',
    postsPerWeek: 2,
    recommendedFor: ['B2B', 'thought leadership', 'long-form content'],
  },
  {
    id: 'weekly' as const,
    label: 'Weekly',
    description: '1 post per week — premium quality',
    postsPerWeek: 1,
    recommendedFor: ['SEO articles', 'newsletters', 'high-production video'],
  },
];

// ─── Content Frameworks ───────────────────────────────────────────────────────

export interface ContentFrameworkDefinition {
  id: ContentFramework;
  name: string;
  fullName: string;
  description: string;
  steps: { label: string; description: string }[];
  bestFor: string[];
  exampleStructure: string;
}

export const CONTENT_FRAMEWORKS: ContentFrameworkDefinition[] = [
  {
    id: 'AIDA',
    name: 'AIDA',
    fullName: 'Attention · Interest · Desire · Action',
    description: 'The classic marketing funnel framework — guide readers from awareness to action',
    steps: [
      { label: 'Attention', description: 'Grab the reader with a powerful hook that stops the scroll' },
      { label: 'Interest', description: 'Build curiosity and relevance with compelling details' },
      { label: 'Desire', description: 'Create emotional connection and make them want the outcome' },
      { label: 'Action', description: 'Give a clear, specific call to action' },
    ],
    bestFor: ['sales posts', 'product launches', 'promotions', 'lead generation'],
    exampleStructure:
      'Hook (Attention) → Why this matters (Interest) → What you gain (Desire) → DM me / Link in bio (Action)',
  },
  {
    id: 'PAS',
    name: 'PAS',
    fullName: 'Problem · Agitate · Solution',
    description: 'Identify the pain, amplify the urgency, then present your solution',
    steps: [
      { label: 'Problem', description: 'Name the exact problem your audience is experiencing' },
      { label: 'Agitate', description: 'Deepen the pain — show the cost of inaction' },
      { label: 'Solution', description: 'Present your product, service or idea as the answer' },
    ],
    bestFor: ['pain-point content', 'B2B', 'educational posts', 'consulting services'],
    exampleStructure:
      'State the problem → Show why it hurts → Reveal the fix',
  },
  {
    id: 'BAB',
    name: 'BAB',
    fullName: 'Before · After · Bridge',
    description: 'Paint the contrast between current struggle and desired outcome, then show the path',
    steps: [
      { label: 'Before', description: 'Describe the current painful or frustrating situation' },
      { label: 'After', description: 'Paint the vivid picture of the desired transformation' },
      { label: 'Bridge', description: 'Explain how to get from before to after' },
    ],
    bestFor: ['testimonials', 'case studies', 'transformation stories', 'coaching'],
    exampleStructure:
      'Where you are now → Where you could be → Here\'s how to get there',
  },
  {
    id: 'PPPP',
    name: 'PPPP',
    fullName: 'Picture · Promise · Prove · Push',
    description: 'Visualise the outcome, make a promise, back it with proof, then drive action',
    steps: [
      { label: 'Picture', description: 'Paint a vivid mental image of the desired outcome' },
      { label: 'Promise', description: 'Make a specific, believable promise about the result' },
      { label: 'Prove', description: 'Back the promise with evidence, data or social proof' },
      { label: 'Push', description: 'Motivate immediate action with urgency or incentive' },
    ],
    bestFor: ['viral content', 'inspirational posts', 'product launches', 'community'],
    exampleStructure:
      'Imagine this... → I promise you can → Here\'s proof → Start today',
  },
];

// ─── Brand Tones ──────────────────────────────────────────────────────────────

export interface BrandToneDefinition {
  id: BrandTone;
  label: string;
  description: string;
  characteristics: string[];
  avoidWords: string[];
  examplePhrase: string;
}

export const BRAND_TONES: BrandToneDefinition[] = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Polished, credible and business-appropriate',
    characteristics: ['formal language', 'data-driven', 'precise', 'authoritative'],
    avoidWords: ['gonna', 'wanna', 'lol', 'omg', 'super'],
    examplePhrase: 'Our research demonstrates a 47% improvement in campaign ROI.',
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Friendly, approachable and conversational',
    characteristics: ['conversational', 'warm', 'relatable', 'down-to-earth'],
    avoidWords: ['hereby', 'pursuant', 'henceforth', 'aforementioned'],
    examplePhrase: 'Hey, here\'s a quick tip that changed everything for us.',
  },
  {
    id: 'witty',
    label: 'Witty',
    description: 'Clever, playful and memorable — entertainment meets value',
    characteristics: ['humour', 'wordplay', 'unexpected angles', 'light sarcasm'],
    avoidWords: ['synergy', 'leverage', 'paradigm shift', 'circle back'],
    examplePhrase: 'Your competitors are sleeping. You should be posting.',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Direct, confident and unapologetically assertive',
    characteristics: ['strong statements', 'no hedging', 'decisive', 'provocative'],
    avoidWords: ['maybe', 'perhaps', 'kind of', 'sort of', 'might'],
    examplePhrase: 'Stop asking for permission. Build the thing. Launch it today.',
  },
  {
    id: 'empathetic',
    label: 'Empathetic',
    description: 'Understanding, supportive and deeply human',
    characteristics: ['validation', 'emotional intelligence', 'nurturing', 'inclusive'],
    avoidWords: ['just do it', 'simple', 'easy', 'obvious', 'clearly'],
    examplePhrase: 'We know how overwhelming this can feel — and that\'s okay.',
  },
  {
    id: 'authoritative',
    label: 'Authoritative',
    description: 'Expert-led, definitive and industry-leading',
    characteristics: ['expertise signals', 'confident', 'evidence-based', 'definitive'],
    avoidWords: ['I think', 'maybe', 'in my opinion', 'I guess'],
    examplePhrase: 'After analysing 10,000 posts, the data is unambiguous.',
  },
  {
    id: 'inspirational',
    label: 'Inspirational',
    description: 'Uplifting, motivating and vision-driven',
    characteristics: ['future-focused', 'emotional', 'empowering', 'aspirational'],
    avoidWords: ['problem', 'failure', 'impossible', 'never'],
    examplePhrase: 'Every great brand started exactly where you are right now.',
  },
];

// ─── Niche Presets ────────────────────────────────────────────────────────────

export interface NichePreset {
  id: string;
  label: string;
  description: string;
  suggestedPlatforms: SocialPlatform[];
  suggestedTones: BrandTone[];
  suggestedFrameworks: ContentFramework[];
  commonPainPoints: string[];
  keyTopics: string[];
}

export const NICHE_PRESETS: NichePreset[] = [
  {
    id: 'e_commerce',
    label: 'E-Commerce / Retail',
    description: 'Online stores selling physical or digital products',
    suggestedPlatforms: ['instagram', 'facebook', 'tiktok'],
    suggestedTones: ['casual', 'bold'],
    suggestedFrameworks: ['AIDA', 'PPPP'],
    commonPainPoints: ['cart abandonment', 'customer acquisition cost', 'returns'],
    keyTopics: ['product launches', 'behind the scenes', 'customer stories', 'deals'],
  },
  {
    id: 'saas',
    label: 'SaaS / Software',
    description: 'Software-as-a-service and tech product companies',
    suggestedPlatforms: ['linkedin', 'twitter'],
    suggestedTones: ['professional', 'witty'],
    suggestedFrameworks: ['PAS', 'BAB'],
    commonPainPoints: ['churn', 'onboarding complexity', 'feature adoption'],
    keyTopics: ['product updates', 'tutorials', 'case studies', 'industry insights'],
  },
  {
    id: 'coaching',
    label: 'Coaching / Consulting',
    description: 'Business, life, career or executive coaching services',
    suggestedPlatforms: ['instagram', 'linkedin', 'facebook'],
    suggestedTones: ['empathetic', 'authoritative', 'inspirational'],
    suggestedFrameworks: ['BAB', 'PAS'],
    commonPainPoints: ['finding ideal clients', 'pricing services', 'scaling beyond 1:1'],
    keyTopics: ['client wins', 'frameworks', 'mindset shifts', 'industry myths'],
  },
  {
    id: 'health_wellness',
    label: 'Health & Wellness',
    description: 'Fitness, nutrition, mental health and holistic wellbeing',
    suggestedPlatforms: ['instagram', 'tiktok', 'youtube'],
    suggestedTones: ['empathetic', 'inspirational', 'casual'],
    suggestedFrameworks: ['BAB', 'PPPP'],
    commonPainPoints: ['motivation', 'consistency', 'information overload'],
    keyTopics: ['transformation stories', 'tips', 'myth-busting', 'routines'],
  },
  {
    id: 'real_estate',
    label: 'Real Estate',
    description: 'Agents, brokers and property developers',
    suggestedPlatforms: ['instagram', 'facebook', 'linkedin'],
    suggestedTones: ['professional', 'authoritative'],
    suggestedFrameworks: ['AIDA', 'PPPP'],
    commonPainPoints: ['lead generation', 'market uncertainty', 'trust building'],
    keyTopics: ['market insights', 'property tours', 'buyer tips', 'investment advice'],
  },
  {
    id: 'financial_services',
    label: 'Finance & Investing',
    description: 'Financial advisors, fintech products and investment education',
    suggestedPlatforms: ['linkedin', 'twitter', 'youtube'],
    suggestedTones: ['authoritative', 'professional'],
    suggestedFrameworks: ['PAS', 'AIDA'],
    commonPainPoints: ['trust', 'compliance constraints', 'financial anxiety'],
    keyTopics: ['market commentary', 'financial literacy', 'case studies', 'planning tips'],
  },
  {
    id: 'food_beverage',
    label: 'Food & Beverage',
    description: 'Restaurants, cafes, food brands and recipe creators',
    suggestedPlatforms: ['instagram', 'tiktok', 'facebook'],
    suggestedTones: ['casual', 'witty'],
    suggestedFrameworks: ['PPPP', 'AIDA'],
    commonPainPoints: ['customer retention', 'seasonal slowdowns', 'online ordering'],
    keyTopics: ['recipe reveals', 'behind the scenes', 'seasonal specials', 'reviews'],
  },
  {
    id: 'fashion_beauty',
    label: 'Fashion & Beauty',
    description: 'Clothing brands, makeup artists and personal stylists',
    suggestedPlatforms: ['instagram', 'tiktok'],
    suggestedTones: ['bold', 'casual', 'inspirational'],
    suggestedFrameworks: ['PPPP', 'AIDA'],
    commonPainPoints: ['trend cycles', 'returns', 'content volume'],
    keyTopics: ['outfit inspiration', 'tutorials', 'new arrivals', 'style tips'],
  },
  {
    id: 'education',
    label: 'Education & Online Courses',
    description: 'Course creators, tutors and EdTech platforms',
    suggestedPlatforms: ['youtube', 'linkedin', 'instagram'],
    suggestedTones: ['authoritative', 'empathetic', 'inspirational'],
    suggestedFrameworks: ['PAS', 'BAB'],
    commonPainPoints: ['course completion rates', 'student acquisition', 'standing out'],
    keyTopics: ['free lessons', 'student success stories', 'learning tips', 'course sneak peeks'],
  },
  {
    id: 'agency',
    label: 'Marketing / Creative Agency',
    description: 'Digital agencies, design studios and creative services',
    suggestedPlatforms: ['linkedin', 'instagram', 'twitter'],
    suggestedTones: ['professional', 'witty', 'bold'],
    suggestedFrameworks: ['BAB', 'PAS'],
    commonPainPoints: ['client acquisition', 'scope creep', 'proving ROI'],
    keyTopics: ['case studies', 'process breakdowns', 'industry trends', 'client wins'],
  },
  {
    id: 'non_profit',
    label: 'Non-Profit / NGO',
    description: 'Charities, social enterprises and cause-driven organisations',
    suggestedPlatforms: ['facebook', 'instagram', 'linkedin'],
    suggestedTones: ['empathetic', 'inspirational'],
    suggestedFrameworks: ['BAB', 'PPPP'],
    commonPainPoints: ['donor engagement', 'volunteer recruitment', 'awareness'],
    keyTopics: ['impact stories', 'mission highlights', 'events', 'volunteer spotlights'],
  },
  {
    id: 'travel',
    label: 'Travel & Hospitality',
    description: 'Travel agencies, hotels and destination marketers',
    suggestedPlatforms: ['instagram', 'tiktok', 'facebook'],
    suggestedTones: ['inspirational', 'casual'],
    suggestedFrameworks: ['PPPP', 'AIDA'],
    commonPainPoints: ['seasonality', 'rebooking rates', 'standing out from aggregators'],
    keyTopics: ['destination highlights', 'travel tips', 'guest stories', 'itineraries'],
  },
  {
    id: 'legal_services',
    label: 'Legal Services',
    description: 'Law firms, solicitors and legal-tech platforms',
    suggestedPlatforms: ['linkedin', 'facebook'],
    suggestedTones: ['professional', 'authoritative', 'empathetic'],
    suggestedFrameworks: ['PAS', 'AIDA'],
    commonPainPoints: ['client trust', 'plain-language communication', 'lead quality'],
    keyTopics: ['legal updates', 'myth-busting', 'Q&A', 'process explanations'],
  },
  {
    id: 'recruitment',
    label: 'Recruitment & HR',
    description: 'Talent acquisition, HR consultants and employer branding',
    suggestedPlatforms: ['linkedin', 'twitter', 'facebook'],
    suggestedTones: ['professional', 'empathetic', 'authoritative'],
    suggestedFrameworks: ['BAB', 'PAS'],
    commonPainPoints: ['talent shortage', 'employer branding', 'candidate ghosting'],
    keyTopics: ['hiring tips', 'culture content', 'industry salaries', 'career advice'],
  },
  {
    id: 'tech_startup',
    label: 'Tech Startup',
    description: 'Early-stage startups building technology products',
    suggestedPlatforms: ['twitter', 'linkedin', 'tiktok'],
    suggestedTones: ['bold', 'witty', 'casual'],
    suggestedFrameworks: ['PAS', 'BAB'],
    commonPainPoints: ['user acquisition', 'product-market fit', 'funding'],
    keyTopics: ['build in public', 'founder journey', 'product demos', 'lessons learned'],
  },
  {
    id: 'personal_brand',
    label: 'Personal Brand / Creator',
    description: 'Individual thought leaders, influencers and content creators',
    suggestedPlatforms: ['instagram', 'tiktok', 'youtube', 'twitter'],
    suggestedTones: ['casual', 'bold', 'inspirational'],
    suggestedFrameworks: ['BAB', 'PPPP'],
    commonPainPoints: ['monetisation', 'algorithm changes', 'burnout'],
    keyTopics: ['personal stories', 'day in the life', 'lessons', 'hot takes'],
  },
  {
    id: 'interior_design',
    label: 'Interior Design / Architecture',
    description: 'Interior designers, architects and home renovation specialists',
    suggestedPlatforms: ['instagram', 'pinterest', 'tiktok'],
    suggestedTones: ['inspirational', 'professional'],
    suggestedFrameworks: ['PPPP', 'BAB'],
    commonPainPoints: ['project timelines', 'client vision alignment', 'portfolio visibility'],
    keyTopics: ['before & after', 'design tips', 'project reveals', 'trend reports'],
  } as NichePreset,
  {
    id: 'automotive',
    label: 'Automotive',
    description: 'Car dealerships, mechanics and automotive brands',
    suggestedPlatforms: ['facebook', 'instagram', 'youtube'],
    suggestedTones: ['bold', 'professional'],
    suggestedFrameworks: ['AIDA', 'PAS'],
    commonPainPoints: ['trust with buyers', 'service transparency', 'online leads'],
    keyTopics: ['vehicle showcases', 'maintenance tips', 'customer stories', 'deals'],
  },
  {
    id: 'pet_care',
    label: 'Pet Care & Veterinary',
    description: 'Vets, pet groomers, trainers and pet product brands',
    suggestedPlatforms: ['instagram', 'facebook', 'tiktok'],
    suggestedTones: ['casual', 'empathetic', 'witty'],
    suggestedFrameworks: ['BAB', 'PPPP'],
    commonPainPoints: ['pet owner anxiety', 'seasonal demand', 'standing out locally'],
    keyTopics: ['pet care tips', 'transformations', 'product recommendations', 'cute content'],
  },
  {
    id: 'events_entertainment',
    label: 'Events & Entertainment',
    description: 'Event planners, venues, performers and entertainment businesses',
    suggestedPlatforms: ['instagram', 'facebook', 'tiktok'],
    suggestedTones: ['bold', 'casual', 'inspirational'],
    suggestedFrameworks: ['AIDA', 'PPPP'],
    commonPainPoints: ['ticket sales', 'event discovery', 'post-event engagement'],
    keyTopics: ['event highlights', 'behind the scenes', 'countdown content', 'testimonials'],
  },
];
