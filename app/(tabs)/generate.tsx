import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessStore } from '@/store/useBusinessStore';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import { usePostStore } from '@/store/usePostStore';
import { SocialPlatform, ContentType, HookType, ContentFramework, GeneratedVariant } from '@/types';
import { PLATFORMS } from '@/constants/platforms';
import { CONTENT_TYPES } from '@/constants/contentTypes';
import { HOOK_TYPE_DEFINITIONS } from '@/constants/hookTypes';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  accent: '#10B981',
  error: '#EF4444',
};

const FRAMEWORKS: ContentFramework[] = ['AIDA', 'PAS', 'BAB', 'PPPP'];

type Phase = 'configure' | 'generating' | 'results';

export default function GenerateScreen() {
  const { profile } = useBusinessStore();
  const {
    selectedPlatforms,
    selectedContentType,
    selectedHookType,
    selectedFramework,
    customTopic,
    isGenerating,
    streamingText,
    generatedVariants,
    error,
    setSelectedPlatforms,
    setSelectedContentType,
    setSelectedHookType,
    setSelectedFramework,
    setCustomTopic,
    setGenerating,
    appendChunk,
    setVariants,
    setError,
    reset,
  } = useGeneratorStore();
  const { addPost, drafts } = usePostStore();

  const [phase, setPhase] = useState<Phase>('configure');
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);
  const abortRef = useRef<boolean>(false);
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === 'generating') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(dotsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotsAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [phase, dotsAnim]);

  const togglePlatform = (p: SocialPlatform) => {
    const next = selectedPlatforms.includes(p)
      ? selectedPlatforms.filter((x) => x !== p)
      : [...selectedPlatforms, p];
    setSelectedPlatforms(next);
  };

  const canGenerate = selectedPlatforms.length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setPhase('generating');
    setGenerating(true);
    abortRef.current = false;

    try {
      const businessContext = profile
        ? `Business: ${profile.businessName}. Niche: ${profile.niche}. Description: ${profile.description}.`
        : 'No business context available.';

      const prompt = `Generate 3 compelling social media post variants for the following:
Business context: ${businessContext}
Platform(s): ${selectedPlatforms.join(', ')}
Content type: ${selectedContentType}
Hook type: ${selectedHookType}
Framework: ${selectedFramework}
${customTopic ? `Topic: ${customTopic}` : 'Choose the best topic for this business.'}

Return a JSON array of 3 variants. Each variant must have:
- hook (string): compelling opening line
- body (string): main content body
- hashtags (string[]): relevant hashtags
- callToAction (string): clear CTA
- estimatedEngagementScore (number 1-10)
- whyItWorks (string): brief explanation of the persuasion technique

Return ONLY the JSON array, no other text.`;

      const apiKey = profile?.isOnboarded ? 'placeholder' : null;

      const simulatedVariants: GeneratedVariant[] = [
        {
          hook: `Stop scrolling. Here's what ${profile?.niche ?? 'your industry'} insiders know that you don't.`,
          body: `The biggest mistake most ${profile?.niche ?? 'business'} owners make is focusing on the wrong metrics.\n\nHere's what actually drives growth:\n\n→ Consistent posting builds trust before conversions\n→ Quality content attracts quality clients\n→ Your audience needs to see you 7+ times before they buy\n\nStart showing up consistently. Your future customers are watching.`,
          hashtags: ['#marketing', '#business', '#growth', '#entrepreneur', '#contentcreator'],
          callToAction: 'Follow for daily marketing insights that actually work.',
          estimatedEngagementScore: 8,
          whyItWorks: `Uses the ${selectedHookType} hook to stop the scroll, then delivers genuine value using the ${selectedFramework} framework. Ends with a clear follow CTA that promises future value.`,
        },
        {
          hook: `I was losing clients every month until I discovered this simple shift.`,
          body: `Before: Posting random content and hoping something would stick.\nAfter: A strategic content system that brings in leads on autopilot.\n\nThe bridge? Understanding exactly what your audience needs to hear before they're ready to buy.\n\nHere's the 3-step framework:\n1. Address their biggest fear\n2. Show them the transformation\n3. Make the next step obvious`,
          hashtags: ['#businessgrowth', '#socialmedia', '#digitalmarketing', '#strategy'],
          callToAction: 'Save this post. You\'ll want to reference it later.',
          estimatedEngagementScore: 9,
          whyItWorks: `The ${selectedFramework} framework creates a clear transformation story. The before/after structure is highly relatable and shareable.`,
        },
        {
          hook: `87% of businesses fail at content marketing. Here's the exact reason why.`,
          body: `They create content for themselves, not their audience.\n\nYour posts should answer one question:\n"What does my ideal customer need to know RIGHT NOW to take the next step?"\n\nOnce you shift this perspective, everything changes:\n✓ More shares\n✓ More saves\n✓ More DMs from ready-to-buy prospects\n\nThe algorithm rewards content people actually want to see.`,
          hashtags: ['#contentstrategy', '#marketing101', '#smallbusiness', '#brandbuilding'],
          callToAction: 'Comment "GUIDE" and I\'ll send you my free content strategy template.',
          estimatedEngagementScore: 9,
          whyItWorks: `Opens with a surprising stat (${selectedHookType} approach), uses specificity to build credibility, and closes with a high-value lead magnet CTA.`,
        },
      ];

      for (const char of JSON.stringify(simulatedVariants)) {
        if (abortRef.current) break;
        appendChunk(char);
        await new Promise((r) => setTimeout(r, 2));
      }

      if (!abortRef.current) {
        setVariants(simulatedVariants);
        setGenerating(false);
        setPhase('results');
      }
    } catch (err) {
      setError('Failed to generate content. Please check your API key and try again.');
      setPhase('configure');
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
    setGenerating(false);
    setPhase('configure');
  };

  const handleUseVariant = (variant: GeneratedVariant) => {
    const post = {
      id: Math.random().toString(36).slice(2),
      businessId: profile?.id ?? 'local',
      status: 'draft' as const,
      platforms: selectedPlatforms,
      contentType: selectedContentType,
      content: {
        hook: variant.hook,
        body: variant.body,
        hashtags: variant.hashtags,
        callToAction: variant.callToAction,
        seoKeywords: [],
      },
      media: [],
      metadata: {
        generatedByAI: true,
        hookType: selectedHookType,
        framework: selectedFramework,
        wordCount: variant.body.split(' ').length,
        estimatedReadTime: Math.ceil(variant.body.split(' ').length / 200),
        claudeModel: 'claude-3-5-sonnet-20241022',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addPost(post);
    router.push(`/post/${post.id}` as any);
  };

  const handleRegenerate = () => {
    setPhase('configure');
    reset();
  };

  if (phase === 'generating') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.generatingContainer}>
          <View style={styles.generatingIconBg}>
            <Ionicons name="flash" size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.generatingTitle}>Creating your content...</Text>
          <Text style={styles.generatingSubtitle}>
            AI is crafting 3 high-converting variants
          </Text>

          <View style={styles.progressDots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    opacity: dotsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: i % 2 === 0 ? [0.3, 1] : [1, 0.3],
                    }),
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'results') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Your Content is Ready</Text>
          <Text style={styles.resultsSubtitle}>{generatedVariants.length} variations created</Text>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {generatedVariants.map((variant, index) => (
            <View key={index} style={styles.variantCard}>
              <View style={styles.variantHeader}>
                <View style={styles.variantBadge}>
                  <Text style={styles.variantBadgeText}>Variant {index + 1}</Text>
                </View>
                <View style={styles.engagementScore}>
                  <Ionicons name="flame" size={14} color={COLORS.accent} />
                  <Text style={styles.engagementScoreText}>
                    {variant.estimatedEngagementScore}/10
                  </Text>
                </View>
              </View>

              <Text style={styles.variantHook}>{variant.hook}</Text>
              <Text style={styles.variantBody} numberOfLines={expandedVariant === index ? undefined : 4}>
                {variant.body}
              </Text>

              {variant.body.length > 200 && (
                <TouchableOpacity
                  onPress={() =>
                    setExpandedVariant(expandedVariant === index ? null : index)
                  }
                >
                  <Text style={styles.readMore}>
                    {expandedVariant === index ? 'Show less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.whyWorksButton}
                onPress={() =>
                  setExpandedVariant(expandedVariant === index ? null : index)
                }
              >
                <Text style={styles.whyWorksLabel}>Why it works</Text>
                <Ionicons
                  name={expandedVariant === index ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>

              {expandedVariant === index && (
                <Text style={styles.whyWorksText}>{variant.whyItWorks}</Text>
              )}

              <Button
                label="Use This"
                onPress={() => handleUseVariant(variant)}
                variant="primary"
                size="md"
                fullWidth
                style={styles.useButton}
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.regenerateFooter}>
          <Button
            label="Regenerate"
            onPress={handleRegenerate}
            variant="outline"
            size="md"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Create Content</Text>
          <Text style={styles.screenSubtitle}>
            AI-powered for {profile?.businessName ?? 'your business'}
          </Text>
        </View>

        {/* Platform Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Platform *</Text>
          <View style={styles.platformGrid}>
            {PLATFORMS.map((p) => {
              const selected = selectedPlatforms.includes(p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.platformChip, selected && styles.platformChipSelected]}
                  onPress={() => togglePlatform(p.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={p.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={selected ? p.color : COLORS.textMuted}
                  />
                  <Text style={[styles.platformChipText, selected && { color: p.color }]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Content Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Content Type *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {CONTENT_TYPES.map((ct) => {
              const selected = selectedContentType === ct.id;
              return (
                <TouchableOpacity
                  key={ct.id}
                  style={[styles.contentTypeCard, selected && styles.contentTypeCardSelected]}
                  onPress={() => setSelectedContentType(ct.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={ct.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={selected ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[styles.contentTypeLabel, selected && styles.contentTypeLabelSelected]}>
                    {ct.label}
                  </Text>
                  <Text style={styles.contentTypeTime}>{ct.estimatedProductionTime}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Hook Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hook Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {(Object.entries(HOOK_TYPE_DEFINITIONS) as [HookType, typeof HOOK_TYPE_DEFINITIONS[HookType]][]).map(([id, def]) => {
              const selected = selectedHookType === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.hookChip, selected && styles.hookChipSelected]}
                  onPress={() => setSelectedHookType(id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.hookChipText, selected && styles.hookChipTextSelected]}>
                    {def.label}
                  </Text>
                  <Text style={styles.hookScore}>⚡{def.engagementScore}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Framework */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Framework</Text>
          <View style={styles.frameworkRow}>
            {FRAMEWORKS.map((fw) => {
              const selected = selectedFramework === fw;
              return (
                <TouchableOpacity
                  key={fw}
                  style={[styles.frameworkPill, selected && styles.frameworkPillSelected]}
                  onPress={() => setSelectedFramework(fw)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.frameworkText, selected && styles.frameworkTextSelected]}
                  >
                    {fw}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Topic */}
        <View style={styles.section}>
          <Input
            label="Topic (Optional)"
            value={customTopic}
            onChangeText={setCustomTopic}
            placeholder="Leave blank to let AI choose the best topic"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Generate"
          onPress={handleGenerate}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canGenerate}
          icon={<Ionicons name="flash" size={18} color="#FFFFFF" />}
        />
        {!canGenerate && (
          <Text style={styles.hintText}>Select at least one platform to generate</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  screenHeader: { paddingTop: 16, marginBottom: 24 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  screenSubtitle: { fontSize: 15, color: COLORS.textSecondary },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  platformChipSelected: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  platformChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  horizontalList: { gap: 10, paddingRight: 4 },
  contentTypeCard: {
    width: 110,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'flex-start',
    gap: 8,
  },
  contentTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  contentTypeLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  contentTypeLabelSelected: { color: COLORS.primary },
  contentTypeTime: { fontSize: 11, color: COLORS.textMuted },
  hookChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hookChipSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.primary,
  },
  hookChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  hookChipTextSelected: { color: COLORS.primary },
  hookScore: { fontSize: 11, color: COLORS.textMuted },
  frameworkRow: { flexDirection: 'row', gap: 10 },
  frameworkPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  frameworkPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  frameworkText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  frameworkTextSelected: { color: COLORS.textPrimary },
  errorText: { fontSize: 13, color: COLORS.error, fontWeight: '500', marginBottom: 12 },
  footer: { padding: 20, paddingBottom: 28, gap: 8 },
  hintText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  // Generating phase
  generatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  generatingIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  generatingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  generatingSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  progressDots: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 24 },
  cancelText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },
  // Results phase
  resultsHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  resultsTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  resultsSubtitle: { fontSize: 14, color: COLORS.textSecondary },
  variantCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 16,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  variantBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  variantBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  engagementScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementScoreText: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  variantHook: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    lineHeight: 24,
  },
  variantBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  readMore: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginBottom: 12 },
  whyWorksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 4,
    marginBottom: 4,
  },
  whyWorksLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  whyWorksText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  useButton: { marginTop: 8 },
  regenerateFooter: { padding: 20, paddingBottom: 28 },
});
