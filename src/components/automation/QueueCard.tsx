import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QueueItem, Post, SocialPlatform } from '@/types';
import PlatformIcon from '@/components/common/PlatformIcon';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  processing: '#3B82F6',
};

const STATUS_CONFIG = {
  pending: { color: COLORS.warning, icon: 'time-outline' as const, label: 'Pending' },
  processing: { color: COLORS.processing, icon: 'sync-outline' as const, label: 'Publishing…' },
  done: { color: COLORS.accent, icon: 'checkmark-circle-outline' as const, label: 'Published' },
  failed: { color: COLORS.error, icon: 'alert-circle-outline' as const, label: 'Failed' },
};

interface QueueCardProps {
  item: QueueItem;
  post?: Post;
  onPublishNow: () => void;
  onRemove: () => void;
}

function formatScheduledAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffM = Math.floor((diffMs % 3_600_000) / 60_000);

  if (diffMs < 0) {
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  if (diffH < 1) return `In ${diffM}m`;
  if (diffH < 24) return `In ${diffH}h ${diffM}m`;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function QueueCard({ item, post, onPublishNow, onRemove }: QueueCardProps) {
  const cfg = STATUS_CONFIG[item.status];
  const preview = post
    ? (post.content.hook || post.content.body).slice(0, 72)
    : 'Post unavailable';
  const isPending = item.status === 'pending';
  const isProcessing = item.status === 'processing';
  const isDone = item.status === 'done';

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      {/* Left accent bar */}
      <View style={[styles.accent, { backgroundColor: cfg.color }]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.platforms}>
            {item.platforms.slice(0, 4).map((p) => (
              <PlatformIcon key={p} platform={p as SocialPlatform} size="sm" style={styles.icon} />
            ))}
          </View>
          <View style={[styles.statusBadge, { borderColor: cfg.color }]}>
            {isProcessing ? (
              <ActivityIndicator size={10} color={cfg.color} style={styles.spinner} />
            ) : (
              <Ionicons name={cfg.icon} size={11} color={cfg.color} />
            )}
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Content preview */}
        <Text style={styles.preview} numberOfLines={2}>
          {preview}{preview.length === 72 ? '…' : ''}
        </Text>

        {/* Error message */}
        {item.error && item.status === 'failed' && (
          <Text style={styles.errorText} numberOfLines={1}>{item.error}</Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.timeRow}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.timeText}>{formatScheduledAt(item.scheduledAt)}</Text>
          </View>

          {!isDone && (
            <View style={styles.actions}>
              {isPending && (
                <TouchableOpacity style={styles.publishBtn} onPress={onPublishNow} activeOpacity={0.75}>
                  <Ionicons name="send-outline" size={13} color={COLORS.textPrimary} />
                  <Text style={styles.publishBtnText}>Post Now</Text>
                </TouchableOpacity>
              )}
              {(item.status === 'failed') && (
                <TouchableOpacity style={styles.retryBtn} onPress={onPublishNow} activeOpacity={0.75}>
                  <Ionicons name="refresh-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onRemove} activeOpacity={0.75} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={15} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardDone: { opacity: 0.6 },
  accent: { width: 4 },
  body: { flex: 1, padding: 13 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  platforms: { flexDirection: 'row', gap: 4 },
  icon: {},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  spinner: { marginRight: 2 },
  statusText: { fontSize: 11, fontWeight: '600' },
  preview: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 10 },
  errorText: { fontSize: 11, color: COLORS.error, marginBottom: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 12, color: COLORS.textMuted },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  publishBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  retryBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  removeBtn: { padding: 4 },
});
