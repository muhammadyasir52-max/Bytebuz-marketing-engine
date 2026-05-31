import { useCallback, useRef, useState } from 'react';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import { useBusinessStore } from '@/store/useBusinessStore';
import { ClaudeService } from '@/services/claude/claudeService';
import { getClaudeApiKey } from '@/services/storage/secureStorage';
import { GeneratePostParams } from '@/services/claude/claudeService';
import { GeneratedVariant } from '@/types';

// ─── Return Type ──────────────────────────────────────────────────────────────

export interface UseClaudeGenerateReturn {
  /** Start generating post variants */
  generate: (overrides?: Partial<GeneratePostParams>) => Promise<void>;
  /** Whether generation is currently in progress */
  isGenerating: boolean;
  /** Live streaming text as it arrives from Claude */
  streamingText: string;
  /** Final generated variants (populated on completion) */
  variants: GeneratedVariant[];
  /** Error message if generation failed */
  error: string | null;
  /** Abort the current generation */
  abort: () => void;
  /** Reset state back to initial */
  reset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useClaudeGenerate(): UseClaudeGenerateReturn {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Zustand store accessors
  const businessProfile = useBusinessStore((state) => state.profile);

  const {
    isGenerating,
    streamingText,
    generatedVariants: variants,
    selectedPlatforms,
    selectedContentType,
    selectedHookType,
    selectedFramework,
    customTopic,
    error,
    setGenerating,
    appendChunk,
    setVariants,
    setError,
    setGenerationProgress,
    reset,
  } = useGeneratorStore();

  // ─── Generate ─────────────────────────────────────────────────────────────

  const generate = useCallback(
    async (overrides?: Partial<GeneratePostParams>): Promise<void> => {
      // Guard: require business profile
      if (!businessProfile) {
        setError('Business profile is required. Please complete onboarding first.');
        return;
      }

      // Guard: require at least one platform
      const platforms = overrides?.platform ?? selectedPlatforms;
      if (!platforms || (Array.isArray(platforms) && platforms.length === 0)) {
        setError('Please select at least one platform.');
        return;
      }

      // Retrieve API key from secure storage
      let apiKey: string | null;
      try {
        apiKey = await getClaudeApiKey();
      } catch (keyError) {
        setError('Failed to retrieve Claude API key. Please check your settings.');
        return;
      }

      if (!apiKey) {
        setError('Claude API key is not set. Please add your API key in Settings.');
        return;
      }

      // Cancel any existing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Set up state for new generation
      setGenerating(true);
      setGenerationProgress(0);

      const params: GeneratePostParams = {
        businessProfile,
        platform: platforms,
        contentType: overrides?.contentType ?? selectedContentType,
        hookType: overrides?.hookType ?? selectedHookType,
        framework: overrides?.framework ?? selectedFramework,
        topic: overrides?.topic ?? (customTopic.trim() || undefined),
        wordCount: overrides?.wordCount,
        seoKeywords: overrides?.seoKeywords,
      };

      const service = new ClaudeService(apiKey);

      // Track progress via chunk count (rough heuristic)
      let chunkCount = 0;
      const onChunk = (chunk: string) => {
        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) return;

        appendChunk(chunk);
        chunkCount++;
        // Estimate progress: typical post generation takes ~50–100 chunks
        const estimatedProgress = Math.min(90, Math.round((chunkCount / 80) * 100));
        setGenerationProgress(estimatedProgress);
      };

      try {
        const generatedVariants = await service.generatePost(params, onChunk);

        // Check if aborted before saving results
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setVariants(generatedVariants);
        setGenerationProgress(100);
        setGenerating(false);
      } catch (generationError) {
        if (abortControllerRef.current?.signal.aborted) {
          // User-initiated abort — reset cleanly
          setGenerating(false);
          return;
        }

        const message =
          generationError instanceof Error
            ? generationError.message
            : 'Generation failed. Please try again.';

        setError(message);
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          abortControllerRef.current = null;
        }
      }
    },
    [
      businessProfile,
      selectedPlatforms,
      selectedContentType,
      selectedHookType,
      selectedFramework,
      customTopic,
      setGenerating,
      appendChunk,
      setVariants,
      setError,
      setGenerationProgress,
    ]
  );

  // ─── Abort ────────────────────────────────────────────────────────────────

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setGenerating(false);
  }, [setGenerating]);

  return {
    generate,
    isGenerating,
    streamingText,
    variants,
    error,
    abort,
    reset,
  };
}
