import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCareStationsStore } from '@/store/useCareStationsStore';
import { CareStationStatus, Device, DeviceStatus } from '@/types';
import { getDeviceTypeConfig } from '@/constants/deviceTypes';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
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

const STATION_STATUS_BADGE: Record<CareStationStatus, { label: string; variant: 'success' | 'muted' | 'warning' }> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'muted' },
  in_storage: { label: 'In Storage', variant: 'warning' },
};

const DEVICE_STATUS_BADGE: Record<DeviceStatus, { label: string; variant: 'success' | 'muted' | 'warning' | 'error' }> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'muted' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
  missing: { label: 'Missing', variant: 'error' },
};

const STATION_STATUS_OPTIONS: { value: CareStationStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'in_storage', label: 'In Storage' },
  { value: 'inactive', label: 'Inactive' },
];

function DeviceRow({
  device,
  onPress,
  onPrint,
}: {
  device: Device;
  onPress: () => void;
  onPrint: () => void;
}) {
  const typeConfig = getDeviceTypeConfig(device.type);
  const statusConfig = DEVICE_STATUS_BADGE[device.status];

  return (
    <TouchableOpacity style={styles.deviceRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.deviceIconBg, { backgroundColor: `${typeConfig.color}22` }]}>
        <Ionicons name={typeConfig.icon as keyof typeof Ionicons.glyphMap} size={20} color={typeConfig.color} />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text style={styles.deviceCode}>{device.code}</Text>
      </View>
      <Badge label={statusConfig.label} variant={statusConfig.variant} size="sm" style={styles.deviceBadge} />
      <TouchableOpacity style={styles.printIconButton} onPress={onPrint} hitSlop={8}>
        <Ionicons name="print-outline" size={18} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function CareStationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCareStationById, updateCareStation, deleteCareStation } = useCareStationsStore();
  const careStation = id ? getCareStationById(id) : undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(careStation?.name ?? '');
  const [location, setLocation] = useState(careStation?.location ?? '');
  const [assignedTo, setAssignedTo] = useState(careStation?.assignedTo ?? '');
  const [status, setStatus] = useState<CareStationStatus>(careStation?.status ?? 'active');

  if (!careStation) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Care station not found"
          action={{ label: 'Back to Care Stations', onPress: () => router.replace('/care-stations') }}
        />
      </SafeAreaView>
    );
  }

  const statusConfig = STATION_STATUS_BADGE[careStation.status];

  const startEditing = () => {
    setName(careStation.name);
    setLocation(careStation.location ?? '');
    setAssignedTo(careStation.assignedTo ?? '');
    setStatus(careStation.status);
    setIsEditing(true);
  };

  const saveEdits = () => {
    if (!name.trim()) return;
    updateCareStation(careStation.id, {
      name: name.trim(),
      location: location.trim() || undefined,
      assignedTo: assignedTo.trim() || undefined,
      status,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Care Station',
      `Delete "${careStation.name}" and its ${careStation.devices.length} tagged device${careStation.devices.length === 1 ? '' : 's'}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCareStation(careStation.id);
            router.replace('/care-stations');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title} numberOfLines={1}>{careStation.name}</Text>
          <Text style={styles.subtitle}>{careStation.code}</Text>
        </View>
        <TouchableOpacity onPress={isEditing ? saveEdits : startEditing} hitSlop={8} style={styles.headerAction}>
          <Ionicons name={isEditing ? 'checkmark' : 'pencil-outline'} size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} hitSlop={8} style={styles.headerAction}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isEditing ? (
          <View style={styles.editCard}>
            <Input label="Care Station Name" value={name} onChangeText={setName} placeholder="e.g. Care Station #1" />
            <Input label="Location (optional)" value={location} onChangeText={setLocation} placeholder="e.g. North Clinic, Room 4" />
            <Input label="Assigned To (optional)" value={assignedTo} onChangeText={setAssignedTo} placeholder="e.g. Jane Doe" />
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {STATION_STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.statusChip, status === opt.value && styles.statusChipActive]}
                  onPress={() => setStatus(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statusChipText, status === opt.value && styles.statusChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.editActions}>
              <Button label="Cancel" onPress={() => setIsEditing(false)} variant="ghost" />
              <Button label="Save" onPress={saveEdits} />
            </View>
          </View>
        ) : (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Badge label={statusConfig.label} variant={statusConfig.variant} />
              {careStation.location && (
                <View style={styles.summaryItem}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.summaryText}>{careStation.location}</Text>
                </View>
              )}
              {careStation.assignedTo && (
                <View style={styles.summaryItem}>
                  <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.summaryText}>{careStation.assignedTo}</Text>
                </View>
              )}
            </View>
            <Button
              label="Print Station Label"
              onPress={() => router.push(`/care-stations/${careStation.id}/print` as any)}
              variant="outline"
              icon={<Ionicons name="print-outline" size={16} color={COLORS.primary} />}
              style={styles.printStationButton}
            />
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Devices ({careStation.devices.length})</Text>
          <TouchableOpacity
            onPress={() => router.push(`/care-stations/${careStation.id}/device/new` as any)}
            style={styles.addDeviceLink}
          >
            <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.addDeviceLinkText}>Add Device</Text>
          </TouchableOpacity>
        </View>

        {careStation.devices.length === 0 ? (
          <EmptyState
            icon="hardware-chip-outline"
            title="No devices tagged yet"
            subtitle="Add each device in this briefcase and print its barcode tag."
            action={{ label: 'Add Device', onPress: () => router.push(`/care-stations/${careStation.id}/device/new` as any) }}
          />
        ) : (
          <View style={styles.deviceList}>
            {careStation.devices.map((device) => (
              <DeviceRow
                key={device.id}
                device={device}
                onPress={() => router.push(`/care-stations/${careStation.id}/device/${device.id}` as any)}
                onPrint={() => router.push(`/care-stations/${careStation.id}/print?deviceId=${device.id}` as any)}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {},
  headerTextGroup: { flex: 1 },
  title: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, letterSpacing: 0.5 },
  headerAction: { paddingHorizontal: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryText: { fontSize: 13, color: COLORS.textSecondary },
  printStationButton: { marginTop: 16 },
  editCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 24,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusChipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.primary,
  },
  statusChipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  statusChipTextActive: { color: COLORS.primary },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  addDeviceLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  addDeviceLinkText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  deviceList: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  deviceIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  deviceCode: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, letterSpacing: 0.4 },
  deviceBadge: { marginRight: 4 },
  printIconButton: { padding: 4 },
  bottomPadding: { height: 20 },
});
