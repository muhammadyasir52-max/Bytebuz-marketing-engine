import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MetaAdCopyVariant } from '@/types';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  metaBlue: '#1877F2',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  surface: '#141428',
  warning: '#F59E0B',
};

function CTRBadge({ ctr }: { ctr: number }) {
  const color = ctr >= 3 ? COLORS.accent : ctr >= 1.5 ? COLORS.warning : COLORS.textMuted;
  const label = ctr >= 3 ? 'High CTR' : ctr >= 1.5 ? 'Good CTR' : 'Avg CTR';
  return (
    <View style={[styles.ctrBadge, { borderColor: color }]}>
      <Ionicons name="trending-up-outline" size={11} color={color} />
      <Text style={[styles.ctrText, { color }]}>{ctr.toFixed(1)}% — {label}</Text>
    </View>
  );
}

interface AdCopyCardProps {
  variant: MetaAdCopyVariant;
  index: number;
  onUse?: (variant: MetaAdCopyVariant) => void;
}

export default function AdCopyCard({ variant, index, onUse }: AdCopyCardProps) {
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
  };

  const handleCopyAll = () => {
    const text = `Headline: ${variant.headline}\n\nPrimary Text: ${variant.primaryText}\n\nDescription: ${variant.description}\n\nCTA: ${variant.callToAction}`;
    copyToClipboard(text);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.variantLabel}>
          <Text style={styles.variantNumber}>Variant {index + 1}</Text>
        </View>
        <CTRBadge ctr={variant.estimatedCTR} />
        <TouchableOpacity onPress={handleCopyAll} activeOpacity={0.75} style={styles.copyAllBtn}>
          <Ionicons name="copy-outline" size={14} color={COLORS.primary} />
          <Text style={styles.copyAllText}>Copy All</Text>
        </TouchableOpacity>
      </View>

      {/* Headline */}
      <View style={styles.fieldRow}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>HEADLINE</Text>
          <Text style={[styles.charCount, variant.headline.length > 40 && styles.charCountOver]}>
            {variant.headline.length}/40
          </Text>
        </View>
        <TouchableOpacity
          style={styles.fieldContent}
          onPress={() => copyToClipboard(variant.headline)}
          activeOpacity={0.75}
        >
          <Text style={styles.headlineText}>{variant.headline}</Text>
          <Ionicons name="copy-outline" size={13} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Primary Text */}
      <View style={styles.fieldRow}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>PRIMARY TEXT</Text>
          <Text style={[styles.charCount, variant.primaryText.length > 125 && styles.charCountWarning]}>
            {variant.primaryText.length} chars
          </Text>
        </View>
        <TouchableOpacity
          style={styles.fieldContent}
          onPress={() => copyToClipboard(variant.primaryText)}
          activeOpacity={0.75}
        >
          <Text style={styles.bodyText}>{variant.primaryText}</Text>
          <Ionicons name="copy-outline" size={13} color={COLORS.textMuted} style={styles.copyIcon} />
        </TouchableOpacity>
      </View>

      {/* Description + CTA */}
      <View style={styles.rowTwo}>
        <View style={[styles.fieldRow, styles.halfField]}>
          <Text style={styles.fieldLabel}>DESCRIPTION</Text>
          <TouchableOpacity
            style={styles.fieldContent}
            onPress={() => copyToClipboard(variant.description)}
            activeOpacity={0.75}
          >
            <Text style={styles.smallText} numberOfLines={2}>{variant.description}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.fieldRow, styles.halfField]}>
          <Text style={styles.fieldLabel}>CTA BUTTON</Text>
          <View style={styles.ctaChip}>
            <Text style={styles.ctaText}>{variant.callToAction.replace(/_/g, ' ')}</Text>
          </View>
        </View>
      </View>

      {/* Why it works */}
      {variant.whyItWorks && (
        <View style={styles.whyRow}>
          <Ionicons name="sparkles-outline" size={13} color={COLORS.primary} />
          <Text style={styles.whyText}>{variant.whyItWorks}</Text>
        </View>
      )}

      {/* Use button */}
      {onUse && (
        <TouchableOpacity
          style={styles.useBtn}
          onPress={() => onUse(variant)}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.textPrimary} />
          <Text style={styles.useBtnText}>Use This Copy</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  variantLabel: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  variantNumber: { fontSize: 11, fontWeight: '800', color: COLORS.textPrimary },
  ctrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flex: 1,
  },
  ctrText: { fontSize: 11, fontWeight: '600' },
  copyAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyAllText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  fieldRow: { marginBottom: 10 },
  halfField: { flex: 1 },
  rowTwo: { flexDirection: 'row', gap: 10 },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  charCount: { fontSize: 10, color: COLORS.textMuted },
  charCountOver: { color: COLORS.error },
  charCountWarning: { color: COLORS.warning },
  fieldContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  headlineText: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  bodyText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  smallText: { flex: 1, fontSize: 12, color: COLORS.textSecondary },
  copyIcon: { marginTop: 2 },
  ctaChip: {
    backgroundColor: COLORS.metaBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ctaText: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  whyText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.metaBlue,
    borderRadius: 10,
    paddingVertical: 10,
  },
  useBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
});
