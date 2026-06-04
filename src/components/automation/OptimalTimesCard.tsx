import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SocialPlatform } from '@/types';
import { getTopOptimalSlots } from '@/services/automation/optimalTimingService';
import PlatformIcon from '@/components/common/PlatformIcon';
import { formatDayLabel } from '@/services/automation/optimalTimingService';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  accent: '#10B981',
  surface: '#141428',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

const PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'];

function ScoreBar({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 5);
  return (
    <View style={styles.scoreBar}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={[styles.scoreDot, i < filled && styles.scoreDotFilled]}
        />
      ))}
    </View>
  );
}

interface OptimalTimesCardProps {
  onSelectTime?: (platform: SocialPlatform, time: string) => void;
}

export default function OptimalTimesCard({ onSelectTime }: OptimalTimesCardProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('instagram');
  const slots = getTopOptimalSlots(selectedPlatform, 5);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Best Times to Post</Text>
      <Text style={styles.subtitle}>Research-backed optimal engagement windows</Text>

      {/* Platform selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformScroll}>
        {PLATFORMS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.platformChip, selectedPlatform === p && styles.platformChipActive]}
            onPress={() => setSelectedPlatform(p)}
            activeOpacity={0.75}
          >
            <PlatformIcon platform={p} size="sm" />
            <Text style={[styles.platformChipText, selectedPlatform === p && styles.platformChipTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Time slots */}
      <View style={styles.slots}>
        {slots.map((slot, i) => (
          <TouchableOpacity
            key={i}
            style={styles.slotRow}
            onPress={() => onSelectTime?.(slot.platform, slot.time)}
            activeOpacity={onSelectTime ? 0.75 : 1}
          >
            <View style={styles.slotLeft}>
              <Text style={styles.slotDay}>{formatDayLabel(slot.dayOfWeek)}</Text>
              <Text style={styles.slotTime}>{slot.time}</Text>
            </View>
            <Text style={styles.slotLabel} numberOfLines={1}>{slot.label}</Text>
            <ScoreBar score={slot.engagementScore} />
          </TouchableOpacity>
        ))}
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
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginBottom: 14 },
  platformScroll: { marginBottom: 14 },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  platformChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}22`,
  },
  platformChipText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  platformChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  slots: { gap: 8 },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  slotLeft: { width: 64 },
  slotDay: { fontSize: 11, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  slotTime: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  slotLabel: { flex: 1, fontSize: 12, color: COLORS.textSecondary },
  scoreBar: { flexDirection: 'row', gap: 3 },
  scoreDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.border },
  scoreDotFilled: { backgroundColor: COLORS.accent },
});
