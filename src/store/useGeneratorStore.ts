import { create } from 'zustand';
import {
  SocialPlatform,
  ContentType,
  HookType,
  ContentFramework,
  GeneratedVariant,
} from '@/types';

interface GeneratorStore {
  isGenerating: boolean;
  streamingText: string;
  generatedVariants: GeneratedVariant[];
  selectedPlatforms: SocialPlatform[];
  selectedContentType: ContentType;
  selectedHookType: HookType;
  selectedFramework: ContentFramework;
  customTopic: string;
  error: string | null;
  generationProgress: number; // 0–100

  setGenerating: (isGenerating: boolean) => void;
  appendChunk: (chunk: string) => void;
  setVariants: (variants: GeneratedVariant[]) => void;
  setSelectedPlatforms: (platforms: SocialPlatform[]) => void;
  setSelectedContentType: (contentType: ContentType) => void;
  setSelectedHookType: (hookType: HookType) => void;
  setSelectedFramework: (framework: ContentFramework) => void;
  setCustomTopic: (topic: string) => void;
  setError: (error: string | null) => void;
  setGenerationProgress: (progress: number) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  isGenerating: false,
  streamingText: '',
  generatedVariants: [] as GeneratedVariant[],
  selectedPlatforms: [] as SocialPlatform[],
  selectedContentType: 'text_post' as ContentType,
  selectedHookType: 'relatable_story' as HookType,
  selectedFramework: 'AIDA' as ContentFramework,
  customTopic: '',
  error: null as string | null,
  generationProgress: 0,
};

export const useGeneratorStore = create<GeneratorStore>()((set) => ({
  ...DEFAULT_STATE,

  setGenerating: (isGenerating) =>
    set({ isGenerating, ...(isGenerating ? { error: null, streamingText: '' } : {}) }),

  appendChunk: (chunk) =>
    set((state) => ({ streamingText: state.streamingText + chunk })),

  setVariants: (generatedVariants) => set({ generatedVariants }),

  setSelectedPlatforms: (selectedPlatforms) => set({ selectedPlatforms }),

  setSelectedContentType: (selectedContentType) => set({ selectedContentType }),

  setSelectedHookType: (selectedHookType) => set({ selectedHookType }),

  setSelectedFramework: (selectedFramework) => set({ selectedFramework }),

  setCustomTopic: (customTopic) => set({ customTopic }),

  setError: (error) => set({ error, isGenerating: false }),

  setGenerationProgress: (generationProgress) => set({ generationProgress }),

  reset: () => set({ ...DEFAULT_STATE }),
}));
