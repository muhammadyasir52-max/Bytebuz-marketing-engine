import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCareStationsStore } from '@/store/useCareStationsStore';
import { CareStation, CareStationStatus } from '@/types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';

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

const STATUS_BADGE: Record<CareStationStatus, { label: string; variant: 'success' | 'muted' | 'warning' }> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'muted' },
  in_storage: { label: 'In Storage', variant: 'warning' },
};

function CareStationCard({ careStation }: { careStation: CareStation }) {
  const statusConfig = STATUS_BADGE[careStation.status];

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => router.push(`/care-stations/${careStation.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIconBg}>
          <Ionicons name="briefcase-outline" size={26} color={COLORS.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.stationName}>{careStation.name}</Text>
          <Text style={styles.stationCode}>{careStation.code}</Text>
        </View>
        <Badge label={statusConfig.label} variant={statusConfig.variant} size="sm" />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="hardware-chip-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.footerText}>
            {careStation.devices.length} device{careStation.devices.length === 1 ? '' : 's'}
          </Text>
        </View>
        {careStation.location && (
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>{careStation.location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function CareStationsScreen() {
  const { careStations } = useCareStationsStore();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Care Stations</Text>
          <Text style={styles.subtitle}>
            {careStations.length > 0
              ? `${careStations.length} care station${careStations.length === 1 ? '' : 's'}`
              : 'Register a briefcase and tag its devices'}
          </Text>
        </View>
      </View>

      {careStations.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="No care stations yet"
          subtitle="Add a care station to start registering and tagging the devices inside it."
          action={{ label: 'Add Care Station', onPress: () => router.push('/care-stations/new') }}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {careStations.map((cs) => (
            <CareStationCard key={cs.id} careStation={cs} />
          ))}

          <Button
            label="Add Care Station"
            onPress={() => router.push('/care-stations/new')}
            variant="outline"
            fullWidth
            icon={<Ionicons name="add" size={18} color={COLORS.primary} />}
            style={styles.addButton}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { paddingTop: 4 },
  headerTextGroup: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  stationName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  stationCode: { fontSize: 13, color: COLORS.textSecondary, letterSpacing: 0.5 },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: COLORS.textMuted },
  addButton: { marginTop: 4 },
});
