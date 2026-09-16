import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import Barcode from 'react-native-barcode-svg';
import * as Print from 'expo-print';
import { useCareStationsStore } from '@/store/useCareStationsStore';
import { getDeviceTypeLabel } from '@/constants/deviceTypes';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';

const COLORS = {
  background: '#0A0A1A',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
};

interface LabelCardProps {
  title: string;
  subtitle: string;
  code: string;
}

function LabelCard({ title, subtitle, code }: LabelCardProps) {
  return (
    <View style={styles.labelCard}>
      <Barcode value={code} format="CODE128" height={60} maxWidth={260} lineColor="#000000" backgroundColor="#FFFFFF" />
      <Text style={styles.labelCode}>{code}</Text>
      <Text style={styles.labelTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.labelSubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function PrintLabelsScreen() {
  const { id, deviceId } = useLocalSearchParams<{ id: string; deviceId?: string }>();
  const { getCareStationById } = useCareStationsStore();
  const careStation = id ? getCareStationById(id) : undefined;
  const device = deviceId ? careStation?.devices.find((d) => d.id === deviceId) : undefined;
  const isSingleDeviceMode = !!deviceId;

  const viewShotRef = useRef<ViewShot>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!careStation || (isSingleDeviceMode && !device)) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Nothing to print"
          action={{ label: 'Back', onPress: () => router.back() }}
        />
      </SafeAreaView>
    );
  }

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const dataUri = await viewShotRef.current?.capture?.();
      if (!dataUri) {
        Alert.alert('Print Failed', 'Could not render the label(s). Please try again.');
        return;
      }
      const html = `
        <html>
          <body style="margin:0;padding:24px;display:flex;justify-content:center;">
            <img src="${dataUri}" style="width:100%;max-width:400px;" />
          </body>
        </html>
      `;
      await Print.printAsync({ html });
    } catch {
      Alert.alert('Print Failed', 'Could not print the label(s). Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isSingleDeviceMode ? 'Print Device Tag' : 'Print Station Labels'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1, result: 'data-uri' }}>
          <View style={styles.sheet}>
            {isSingleDeviceMode && device ? (
              <LabelCard title={device.name} subtitle={getDeviceTypeLabel(device.type)} code={device.code} />
            ) : (
              <>
                <LabelCard title={careStation.name} subtitle="Care Station" code={careStation.code} />
                {careStation.devices.map((d) => (
                  <LabelCard key={d.id} title={d.name} subtitle={getDeviceTypeLabel(d.type)} code={d.code} />
                ))}
              </>
            )}
          </View>
        </ViewShot>

        <Button
          label={isPrinting ? 'Preparing…' : 'Print'}
          onPress={handlePrint}
          loading={isPrinting}
          fullWidth
          icon={<Ionicons name="print-outline" size={16} color={COLORS.textPrimary} />}
          style={styles.printButton}
        />
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
  title: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  labelCard: {
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D4D4D8',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  labelCode: { fontSize: 12, color: '#3F3F46', letterSpacing: 1, marginTop: 6 },
  labelTitle: { fontSize: 15, fontWeight: '700', color: '#18181B', marginTop: 6 },
  labelSubtitle: { fontSize: 12, color: '#71717A', marginTop: 2 },
  printButton: { marginTop: 20 },
});
