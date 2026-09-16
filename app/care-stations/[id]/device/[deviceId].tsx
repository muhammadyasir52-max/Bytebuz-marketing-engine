import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCareStationsStore } from '@/store/useCareStationsStore';
import { DeviceStatus, DeviceType } from '@/types';
import { DEVICE_TYPES } from '@/constants/deviceTypes';
import Input from '@/components/common/Input';
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
  error: '#EF4444',
};

const DEVICE_STATUS_OPTIONS: { value: DeviceStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'missing', label: 'Missing' },
];

export default function EditDeviceScreen() {
  const { id, deviceId } = useLocalSearchParams<{ id: string; deviceId: string }>();
  const { getCareStationById, updateDevice, deleteDevice } = useCareStationsStore();
  const careStation = id ? getCareStationById(id) : undefined;
  const device = careStation?.devices.find((d) => d.id === deviceId);

  const [name, setName] = useState(device?.name ?? '');
  const [type, setType] = useState<DeviceType>(device?.type ?? 'blood_pressure_monitor');
  const [serialNumber, setSerialNumber] = useState(device?.serialNumber ?? '');
  const [status, setStatus] = useState<DeviceStatus>(device?.status ?? 'active');
  const [nameError, setNameError] = useState('');

  if (!careStation || !device) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Device not found"
          action={{ label: 'Back', onPress: () => router.back() }}
        />
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Give this device a name');
      return;
    }
    updateDevice(careStation.id, device.id, {
      name: name.trim(),
      type,
      serialNumber: serialNumber.trim() || undefined,
      status,
    });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete Device', `Delete "${device.name}" from this care station?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteDevice(careStation.id, device.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{device.name}</Text>
        <TouchableOpacity
          onPress={() => router.push(`/care-stations/${careStation.id}/print?deviceId=${device.id}` as any)}
          hitSlop={8}
          style={styles.headerAction}
        >
          <Ionicons name="print-outline" size={20} color={COLORS.primary} />
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
        <Text style={styles.codeLabel}>{device.code}</Text>

        <Input
          label="Device Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (nameError) setNameError('');
          }}
          placeholder="e.g. Omron BP Monitor"
          error={nameError}
        />

        <Text style={styles.label}>Device Type</Text>
        <View style={styles.typeGrid}>
          {DEVICE_TYPES.map((dt) => (
            <TouchableOpacity
              key={dt.id}
              style={[styles.typeChip, type === dt.id && styles.typeChipActive]}
              onPress={() => setType(dt.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={dt.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={type === dt.id ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.typeChipText, type === dt.id && styles.typeChipTextActive]}>
                {dt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Serial Number (optional)"
          value={serialNumber}
          onChangeText={setSerialNumber}
          placeholder="e.g. SN-4821A"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {DEVICE_STATUS_OPTIONS.map((opt) => (
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

        <Button label="Save Changes" onPress={handleSave} fullWidth style={styles.saveButton} />
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
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3 },
  headerAction: { paddingHorizontal: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  codeLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.primary,
  },
  typeChipText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  typeChipTextActive: { color: COLORS.primary },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
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
  saveButton: { marginTop: 4 },
});
