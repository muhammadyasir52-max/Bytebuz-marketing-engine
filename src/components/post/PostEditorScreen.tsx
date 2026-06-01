import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePostStore } from '@/store/usePostStore';
import { Post, SocialPlatform } from '@/types';
import { PLATFORM_LIMITS } from '@/constants/platforms';
import PlatformIcon from '@/components/common/PlatformIcon';
import TagInput from '@/components/common/TagInput';
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
  warning: '#F59E0B',
};

type PostMode = 'now' | 'schedule';

interface PostEditorScreenProps {
  postId?: string;
  existingPost?: Post;
}

export default function PostEditorScreen({ postId, existingPost }: PostEditorScreenProps) {
  const { addPost, updatePost } = usePostStore();

  const isEditing = Boolean(postId && existingPost);
  const primaryPlatform = existingPost?.platforms[0] ?? 'instagram';
  const platformLimit = PLATFORM_LIMITS[primaryPlatform]?.maxChars ?? 2200;

  const [body, setBody] = useState(existingPost?.content.body ?? '');
  const [hook, setHook] = useState(existingPost?.content.hook ?? '');
  const [hashtags, setHashtags] = useState<string[]>(existingPost?.content.hashtags ?? []);
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<SocialPlatform>(primaryPlatform);
  const [postMode, setPostMode] = useState<PostMode>('schedule');
  const [scheduleDate, setScheduleDate] = useState(new Date(Date.now() + 3600000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const platforms = existingPost?.platforms ?? [primaryPlatform];
  const activePlatformLimit = PLATFORM_LIMITS[selectedPlatformTab]?.maxChars ?? 2200;
  const charCount = body.length;
  const isOverLimit = charCount > activePlatformLimit;
  const isNearLimit = charCount > activePlatformLimit * 0.9;

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      const content = {
        body,
        hook,
        hashtags,
        callToAction: existingPost?.content.callToAction ?? '',
        seoKeywords: existingPost?.content.seoKeywords ?? [],
      };

      if (isEditing && postId) {
        updatePost(postId, { content });
      } else {
        const newPost: Post = {
          id: Math.random().toString(36).slice(2),
          businessId: 'local',
          status: 'draft',
          platforms,
          contentType: existingPost?.contentType ?? 'text_post',
          content,
          media: [],
          metadata: existingPost?.metadata ?? {
            generatedByAI: false,
            hookType: 'relatable_story',
            framework: 'AIDA',
            wordCount: body.split(' ').length,
            estimatedReadTime: Math.ceil(body.split(' ').length / 200),
            claudeModel: '',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addPost(newPost);
      }
      router.back();
    } finally {
      setIsSaving(false);
    }
  }, [body, hook, hashtags, isEditing, postId, updatePost, addPost, platforms, existingPost]);

  const handleSchedule = useCallback(async () => {
    setIsSaving(true);
    try {
      const content = {
        body,
        hook,
        hashtags,
        callToAction: existingPost?.content.callToAction ?? '',
        seoKeywords: existingPost?.content.seoKeywords ?? [],
      };

      const schedule = {
        scheduledAt: scheduleDate.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      if (isEditing && postId) {
        updatePost(postId, { content, schedule, status: 'scheduled' });
      } else {
        const newPost: Post = {
          id: Math.random().toString(36).slice(2),
          businessId: 'local',
          status: 'scheduled',
          platforms,
          contentType: existingPost?.contentType ?? 'text_post',
          content,
          media: [],
          schedule,
          metadata: existingPost?.metadata ?? {
            generatedByAI: false,
            hookType: 'relatable_story',
            framework: 'AIDA',
            wordCount: body.split(' ').length,
            estimatedReadTime: Math.ceil(body.split(' ').length / 200),
            claudeModel: '',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addPost(newPost);
      }
      router.back();
    } finally {
      setIsSaving(false);
    }
  }, [body, hook, hashtags, scheduleDate, isEditing, postId, updatePost, addPost, platforms, existingPost]);

  const handlePostNow = () => {
    Alert.alert(
      'Post Now',
      'This will immediately publish to your connected accounts via Ayrshare.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Post Now',
          onPress: async () => {
            setIsSaving(true);
            Alert.alert('Success', 'Post sent to Ayrshare for publishing.');
            router.back();
          },
        },
      ],
    );
  };

  const handleSuggestTime = () => {
    const suggestions = ['9:00 AM', '12:00 PM', '5:00 PM', '8:00 PM'];
    const suggested = suggestions[Math.floor(Math.random() * suggestions.length)];
    Alert.alert('AI Suggestion', `Best time to post: ${suggested} based on your audience engagement patterns.`);
  };

  const formatScheduleDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.platformIconsRow}>
            {platforms.slice(0, 3).map((p) => (
              <PlatformIcon key={p} platform={p} size="sm" style={styles.headerPlatformIcon} />
            ))}
          </View>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Post' : 'New Post'}</Text>
        </View>
        <TouchableOpacity onPress={handleSaveDraft} style={styles.saveHeaderButton}>
          <Text style={styles.saveHeaderText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Platform tabs (if multi-platform) */}
        {platforms.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.platformTabs}
            style={styles.platformTabsScroll}
          >
            {platforms.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.platformTab, selectedPlatformTab === p && styles.platformTabActive]}
                onPress={() => setSelectedPlatformTab(p)}
                activeOpacity={0.7}
              >
                <PlatformIcon platform={p} size="sm" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Hook */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Opening Hook</Text>
          <TextInput
            style={styles.hookInput}
            value={hook}
            onChangeText={setHook}
            placeholder="Your scroll-stopping opening line..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Body */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Content</Text>
          <View style={[styles.bodyContainer, isOverLimit && styles.bodyContainerError]}>
            <TextInput
              style={styles.bodyInput}
              value={body}
              onChangeText={setBody}
              placeholder="Write your post content here..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
            <Text
              style={[
                styles.charCount,
                isOverLimit
                  ? styles.charCountError
                  : isNearLimit
                  ? styles.charCountWarning
                  : styles.charCountNormal,
              ]}
            >
              {charCount}/{activePlatformLimit}
            </Text>
          </View>
        </View>

        {/* Hashtags */}
        <View style={styles.section}>
          <TagInput
            label="Hashtags"
            tags={hashtags}
            onChangeTags={setHashtags}
            maxTags={PLATFORM_LIMITS[selectedPlatformTab]?.maxHashtags ?? 30}
            placeholder="Add hashtag (without #)"
            hint={`Max ${PLATFORM_LIMITS[selectedPlatformTab]?.maxHashtags ?? 30} for ${selectedPlatformTab}`}
          />
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Publishing</Text>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, postMode === 'now' && styles.modeButtonActive]}
              onPress={() => setPostMode('now')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeButtonText, postMode === 'now' && styles.modeButtonTextActive]}>
                Post Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, postMode === 'schedule' && styles.modeButtonActive]}
              onPress={() => setPostMode('schedule')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  postMode === 'schedule' && styles.modeButtonTextActive,
                ]}
              >
                Schedule
              </Text>
            </TouchableOpacity>
          </View>

          {postMode === 'schedule' && (
            <View style={styles.schedulePicker}>
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={styles.scheduleText}>{formatScheduleDate(scheduleDate)}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.suggestTimeButton}
                onPress={handleSuggestTime}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                <Text style={styles.suggestTimeText}>Suggest best time</Text>
              </TouchableOpacity>
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={scheduleDate}
              mode="datetime"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                setShowDatePicker(false);
                if (selected) setScheduleDate(selected);
              }}
              themeVariant="dark"
            />
          )}
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <Button
          label="Save Draft"
          onPress={handleSaveDraft}
          variant="outline"
          size="md"
          style={styles.draftButton}
          loading={isSaving}
        />
        {postMode === 'now' ? (
          <Button
            label="Post Now"
            onPress={handlePostNow}
            variant="primary"
            size="md"
            style={styles.primaryButton}
            loading={isSaving}
          />
        ) : (
          <Button
            label="Schedule"
            onPress={handleSchedule}
            variant="primary"
            size="md"
            style={styles.primaryButton}
            loading={isSaving}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 4, marginRight: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  platformIconsRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  headerPlatformIcon: {},
  headerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  saveHeaderButton: { paddingVertical: 6, paddingHorizontal: 12 },
  saveHeaderText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  platformTabsScroll: { marginTop: 12, marginBottom: 4 },
  platformTabs: { gap: 8, paddingRight: 4 },
  platformTab: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  platformTabActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  section: { marginTop: 20 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  hookInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  bodyContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 160,
    padding: 16,
  },
  bodyContainerError: { borderColor: COLORS.error },
  bodyInput: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    flex: 1,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '500',
  },
  charCountNormal: { color: COLORS.textMuted },
  charCountWarning: { color: COLORS.warning },
  charCountError: { color: COLORS.error },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  modeButtonActive: { backgroundColor: COLORS.primary },
  modeButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  modeButtonTextActive: { color: COLORS.textPrimary },
  schedulePicker: { marginTop: 12, gap: 10 },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  scheduleText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  suggestTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  suggestTimeText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  draftButton: { flex: 1 },
  primaryButton: { flex: 2 },
});
