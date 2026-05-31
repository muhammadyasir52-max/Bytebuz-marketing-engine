import { HookType } from '@/types';

export interface HookTypeDefinition {
  id: HookType;
  label: string;
  description: string;
  formula: string;
  example: string;
  engagementScore: number; // 1-10
  bestFor: string[];
}

export const HOOK_TYPES: HookType[] = [
  'controversial_opinion',
  'surprising_stat',
  'relatable_story',
  'how_to',
  'listicle',
  'question',
  'bold_claim',
  'pattern_interrupt',
];

export const HOOK_TYPE_DEFINITIONS: Record<HookType, HookTypeDefinition> = {
  controversial_opinion: {
    id: 'controversial_opinion',
    label: 'Controversial Opinion',
    description: 'Challenge conventional wisdom to spark debate and engagement',
    formula: '[Unpopular opinion]: [Your contrarian take on an industry norm]',
    example:
      'Unpopular opinion: Posting every day on social media is killing your brand. Quality beats quantity every single time.',
    engagementScore: 9,
    bestFor: ['thought leadership', 'brand awareness', 'community building'],
  },
  surprising_stat: {
    id: 'surprising_stat',
    label: 'Surprising Statistic',
    description: 'Lead with an unexpected data point that stops the scroll',
    formula: '[Shocking number]% of [audience] [surprising fact]. Here\'s what that means for you...',
    example:
      '97% of businesses never make it past $1M in revenue. The reason? They focus on the wrong metrics entirely.',
    engagementScore: 8,
    bestFor: ['education', 'thought leadership', 'lead generation'],
  },
  relatable_story: {
    id: 'relatable_story',
    label: 'Relatable Story',
    description: 'Share a personal experience your audience will immediately recognise',
    formula: 'I used to [struggle/believe/do]. Until one day [turning point]. Now [result].',
    example:
      'I used to spend 4 hours a day creating content and getting zero results. Until one day I changed one thing. Now I work 45 minutes and get 10x the engagement.',
    engagementScore: 8,
    bestFor: ['brand humanisation', 'community', 'sales'],
  },
  how_to: {
    id: 'how_to',
    label: 'How-To',
    description: 'Deliver immediate actionable value in a clear step-by-step format',
    formula: 'How to [achieve desired result] in [timeframe/steps] (without [pain point])',
    example:
      'How to write 30 days of content in 2 hours (without burning out or sounding robotic)',
    engagementScore: 7,
    bestFor: ['education', 'traffic', 'lead generation'],
  },
  listicle: {
    id: 'listicle',
    label: 'Listicle',
    description: 'Present a numbered list that promises clear, digestible value',
    formula: '[Number] [things/ways/reasons] [target audience] [compelling outcome]',
    example:
      '7 reasons your content gets ignored (and exactly how to fix each one)',
    engagementScore: 7,
    bestFor: ['education', 'shareability', 'brand awareness'],
  },
  question: {
    id: 'question',
    label: 'Engaging Question',
    description: 'Open with a question that compels your audience to reflect and respond',
    formula: 'What if [challenge assumption]? Most [audience] think [common belief]. But...',
    example:
      'What if the reason you\'re not growing on social media has nothing to do with your content? Most creators think it\'s about posting more. But...',
    engagementScore: 7,
    bestFor: ['community building', 'brand awareness', 'engagement'],
  },
  bold_claim: {
    id: 'bold_claim',
    label: 'Bold Claim',
    description: 'Make a confident, specific promise that creates immediate curiosity',
    formula: 'I can help you [specific outcome] in [timeframe] — even if [common objection].',
    example:
      'I can help you get your first 1,000 followers in 30 days — even if you have zero experience and hate being on camera.',
    engagementScore: 9,
    bestFor: ['sales', 'lead generation', 'brand awareness'],
  },
  pattern_interrupt: {
    id: 'pattern_interrupt',
    label: 'Pattern Interrupt',
    description: 'Break the reader\'s autopilot with an unexpected opening that demands attention',
    formula: '[Unexpected statement]. [Brief pause / contrast]. [Payoff].',
    example:
      'Stop creating content. Seriously. Until you read this. Because everything you\'ve been taught about going viral is backwards.',
    engagementScore: 10,
    bestFor: ['viral potential', 'brand awareness', 'thought leadership'],
  },
};

export function getHookDefinition(type: HookType): HookTypeDefinition {
  return HOOK_TYPE_DEFINITIONS[type];
}

export function getHooksByEngagementScore(minScore: number = 7): HookTypeDefinition[] {
  return Object.values(HOOK_TYPE_DEFINITIONS).filter(
    (def) => def.engagementScore >= minScore
  );
}
