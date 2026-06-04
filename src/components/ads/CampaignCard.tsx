import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MetaCampaign, MetaAdStatus, MetaCampaignObjective } from '@/types';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  metaBlue: '#1877F2',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  surface: '#141428',
};

const STATUS_CONFIG: Record<MetaAdStatus, { color: string; label: string; icon: string }> = {
  ACTIVE: { color: COLORS.accent, label: 'Active', icon: 'play-circle-outline' },
  PAUSED: { color: COLORS.warning, label: 'Paused', icon: 'pause-circle-outline' },
  ARCHIVED: { color: COLORS.textMuted, label: 'Archived', icon: 'archive-outline' },
  DELETED: { color: COLORS.error, label: 'Deleted', icon: 'trash-outline' },
};

const OBJECTIVE_LABELS: Record<MetaCampaignObjective, { label: string; icon: string }> = {
  OUTCOME_AWARENESS: { label: 'Awareness', icon: 'eye-outline' },
  OUTCOME_ENGAGEMENT: { label: 'Engagement', icon: 'heart-outline' },
  OUTCOME_LEADS: { label: 'Leads', icon: 'person-add-outline' },
  OUTCOME_SALES: { label: 'Sales', icon: 'cart-outline' },
  OUTCOME_TRAFFIC: { label: 'Traffic', icon: 'globe-outline' },
  OUTCOME_APP_PROMOTION: { label: 'App Installs', icon: 'phone-portrait-outline' },
};

function formatCurrency(amount: number, currency = 'USD'): string {
  if (amount === 0) return '—';
  if (amount < 100) return `${currency} ${amount.toFixed(2)}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(n: number): string {
  if (n === 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

interface CampaignCardProps {
  campaign: MetaCampaign;
  currency?: string;
  onPress: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onDelete?: () => void;
  onAnalyze?: () => void;
}

export default function CampaignCard({
  campaign,
  currency = 'USD',
  onPress,
  onPause,
  onResume,
  onDelete,
  onAnalyze,
}: CampaignCardProps) {
  const status = STATUS_CONFIG[campaign.status];
  const objective = OBJECTIVE_LABELS[campaign.objective];
  const ins = campaign.insights;
  const isActive = campaign.status === 'ACTIVE';
  const isPaused = campaign.status === 'PAUSED';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Status stripe */}
      <View style={[styles.stripe, { backgroundColor: status.color }]} />

      <View style={styles.body}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.campaignName} numberOfLines={1}>{campaign.name}</Text>
            <View style={styles.tagsRow}>
              <View style={[styles.statusChip, { borderColor: status.color }]}>
                <Ionicons name={status.icon as any} size={11} color={status.color} />
                <Text style={[styles.chipText, { color: status.color }]}>{status.label}</Text>
              </View>
              <View style={styles.objectiveChip}>
                <Ionicons name={objective.icon as any} size={11} color={COLORS.textMuted} />
                <Text style={styles.objectiveText}>{objective.label}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </View>

        {/* Metrics grid */}
        {ins && (
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatCurrency(ins.spend, currency)}</Text>
              <Text style={styles.metricLabel}>Spend</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatNumber(ins.impressions)}</Text>
              <Text style={styles.metricLabel}>Impressions</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatNumber(ins.clicks)}</Text>
              <Text style={styles.metricLabel}>Clicks</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{ins.ctr.toFixed(2)}%</Text>
              <Text style={styles.metricLabel}>CTR</Text>
            </View>
          </View>
        )}

        {/* Budget info */}
        {(campaign.dailyBudget || campaign.lifetimeBudget) && (
          <View style={styles.budgetRow}>
            <Ionicons name="wallet-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.budgetText}>
              {campaign.dailyBudget
                ? `${formatCurrency(campaign.dailyBudget / 100, currency)}/day`
                : `${formatCurrency((campaign.lifetimeBudget ?? 0) / 100, currency)} lifetime`}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {onAnalyze && (
            <TouchableOpacity style={styles.analyzeBtn} onPress={onAnalyze} activeOpacity={0.75}>
              <Ionicons name="sparkles-outline" size={13} color={COLORS.primary} />
              <Text style={styles.analyzeBtnText}>AI Analysis</Text>
            </TouchableOpacity>
          )}
          {isActive && onPause && (
            <TouchableOpacity style={styles.actionBtn} onPress={onPause} activeOpacity={0.75}>
              <Ionicons name="pause-outline" size={14} color={COLORS.warning} />
              <Text style={[styles.actionBtnText, { color: COLORS.warning }]}>Pause</Text>
            </TouchableOpacity>
          )}
          {isPaused && onResume && (
            <TouchableOpacity style={[styles.actionBtn, styles.resumeBtn]} onPress={onResume} activeOpacity={0.75}>
              <Ionicons name="play-outline" size={14} color={COLORS.textPrimary} />
              <Text style={[styles.actionBtnText, { color: COLORS.textPrimary }]}>Resume</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} activeOpacity={0.75} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  stripe: { width: 4 },
  body: { flex: 1, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  headerLeft: { flex: 1, marginRight: 8 },
  campaignName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  tagsRow: { flexDirection: 'row', gap: 8 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
  },
  chipText: { fontSize: 11, fontWeight: '600' },
  objectiveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.surface, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.border,
  },
  objectiveText: { fontSize: 11, color: COLORS.textMuted },
  metricsGrid: {
    flexDirection: 'row', gap: 0,
    backgroundColor: COLORS.surface, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 10, overflow: 'hidden',
  },
  metricItem: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRightWidth: 1, borderRightColor: COLORS.border,
  },
  metricValue: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  metricLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginTop: 2 },
  budgetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10,
  },
  budgetText: { fontSize: 12, color: COLORS.textMuted },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  analyzeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  analyzeBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  resumeBtn: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  actionBtnText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { padding: 6 },
});
