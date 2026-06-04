import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AutomationRule, SocialPlatform } from '@/types';
import PlatformIcon from '@/components/common/PlatformIcon';
import { formatDayLabel } from '@/services/automation/optimalTimingService';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  error: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  surface: '#141428',
};

interface AutomationRuleCardProps {
  rule: AutomationRule;
  nextDates: string[];
  onToggle: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

function formatNextDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AutomationRuleCard({
  rule,
  nextDates,
  onToggle,
  onDelete,
  onEdit,
}: AutomationRuleCardProps) {
  const activeDays = rule.daysOfWeek.map((d) => formatDayLabel(d)).join(', ');
  const times = rule.useOptimalTimes ? 'Optimal times' : rule.postTimes.join(', ');

  return (
    <View style={[styles.card, !rule.isEnabled && styles.cardDisabled]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: rule.isEnabled ? COLORS.accent : COLORS.textMuted }]} />
          <Text style={styles.ruleName} numberOfLines={1}>{rule.name}</Text>
        </View>
        <Switch
          value={rule.isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={COLORS.textPrimary}
        />
      </View>

      {/* Platforms */}
      <View style={styles.platforms}>
        {rule.platforms.map((p) => (
          <PlatformIcon key={p} platform={p as SocialPlatform} size="sm" style={styles.platformIcon} />
        ))}
      </View>

      {/* Schedule info */}
      <View style={styles.scheduleRow}>
        <View style={styles.scheduleItem}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.scheduleText}>{rule.useOptimalTimes ? 'Optimal days' : activeDays}</Text>
        </View>
        <View style={styles.scheduleItem}>
          <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.scheduleText}>{times}</Text>
        </View>
      </View>

      {/* Next scheduled */}
      {nextDates.length > 0 && rule.isEnabled && (
        <View style={styles.nextSection}>
          <Text style={styles.nextLabel}>Next posts</Text>
          {nextDates.slice(0, 2).map((d, i) => (
            <View key={i} style={styles.nextRow}>
              <View style={styles.nextDot} />
              <Text style={styles.nextDate}>{formatNextDate(d)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.75}>
            <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.75}>
          <Ionicons name="trash-outline" size={14} color={COLORS.error} />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  cardDisabled: { opacity: 0.55 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  ruleName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  platforms: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  platformIcon: {},
  scheduleRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scheduleText: { fontSize: 12, color: COLORS.textSecondary },
  nextSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nextLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  nextDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary },
  nextDate: { fontSize: 12, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: 10 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.error },
});
