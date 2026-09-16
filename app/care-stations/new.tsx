import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCareStationsStore } from '@/store/useCareStationsStore';
import { CareStationStatus } from '@/types';
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
};

const STATUS_OPTIONS: { value: CareStationStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'in_storage', label: 'In Storage' },
  { value: 'inactive', label: 'Inactive' },
];

export default function NewCareStationScreen() {
  const { addCareStation } = useCareStationsStore();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<CareStationStatus>('active');
  const [nameError, setNameError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Give this care station a name');
      return;
    }

    const careStation = addCareStation({
      name: name.trim(),
      location: location.trim() || undefined,
      assignedTo: assignedTo.trim() || undefined,
      status,
      notes: undefined,
    });

    router.replace(`/care-stations/${careStation.id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Care Station</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Care Station Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (nameError) setNameError('');
          }}
          placeholder="e.g. Care Station #1"
          error={nameError}
        />

        <Input
          label="Location (optional)"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. North Clinic, Room 4"
        />

        <Input
          label="Assigned To (optional)"
          value={assignedTo}
          onChangeText={setAssignedTo}
          placeholder="e.g. Jane Doe"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.statusChip, status === opt.value && styles.statusChipActive]}
              onPress={() => setStatus(opt.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.statusChipText, status === opt.value && styles.statusChipTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button label="Save Care Station" onPress={handleSave} fullWidth style={styles.saveButton} />
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
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {},
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
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
  saveButton: { marginTop: 12 },
});
