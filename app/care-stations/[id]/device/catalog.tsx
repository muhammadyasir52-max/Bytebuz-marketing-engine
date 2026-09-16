import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCareStationsStore } from '@/store/useCareStationsStore';
import { DEVICE_CATALOG } from '@/constants/deviceCatalog';
import { getDeviceTypeConfig } from '@/constants/deviceTypes';
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
};

export default function DeviceCatalogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCareStationById, addDevicesFromCatalog } = useCareStationsStore();
  const careStation = id ? getCareStationById(id) : undefined;

  const addedCatalogIds = new Set(
    careStation?.devices.map((d) => d.catalogId).filter((catalogId): catalogId is string => !!catalogId),
  );
  const availableItems = DEVICE_CATALOG.filter((item) => !addedCatalogIds.has(item.id));

  const [selectedIds, setSelectedIds] = useState<string[]>(availableItems.map((item) => item.id));

  if (!careStation) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Care station not found"
          action={{ label: 'Back', onPress: () => router.back() }}
        />
      </SafeAreaView>
    );
  }

  const toggleSelected = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId],
    );
  };

  const handleAdd = () => {
    if (selectedIds.length === 0) return;
    addDevicesFromCatalog(careStation.id, selectedIds);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Add From Catalog</Text>
          <Text style={styles.subtitle}>Standard devices for this care station</Text>
        </View>
      </View>

      {DEVICE_CATALOG.length === 0 ? (
        <EmptyState icon="hardware-chip-outline" title="Catalog is empty" />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {DEVICE_CATALOG.map((item) => {
            const isAdded = addedCatalogIds.has(item.id);
            const isSelected = selectedIds.includes(item.id);
            const typeConfig = getDeviceTypeConfig(item.type);

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, isAdded && styles.rowDisabled]}
                onPress={() => !isAdded && toggleSelected(item.id)}
                activeOpacity={isAdded ? 1 : 0.75}
                disabled={isAdded}
              >
                <View style={[styles.iconBg, { backgroundColor: `${typeConfig.color}22` }]}>
                  <Ionicons
                    name={typeConfig.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={typeConfig.color}
                  />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowType}>{typeConfig.label}</Text>
                </View>
                {isAdded ? (
                  <Badge label="Added" variant="success" size="sm" />
                ) : (
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? COLORS.primary : COLORS.textMuted}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          <Button
            label={selectedIds.length > 0 ? `Add ${selectedIds.length} Device${selectedIds.length === 1 ? '' : 's'}` : 'Select Devices to Add'}
            onPress={handleAdd}
            disabled={selectedIds.length === 0}
            fullWidth
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
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
  },
  rowDisabled: { opacity: 0.5 },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  rowType: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  addButton: { marginTop: 12 },
});
