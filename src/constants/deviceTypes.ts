import { DeviceType } from '@/types';

export interface DeviceTypeConfig {
  id: DeviceType;
  label: string;
  icon: string; // Ionicons name
  color: string;
}

export const DEVICE_TYPES: DeviceTypeConfig[] = [
  {
    id: 'blood_pressure_monitor',
    label: 'Blood Pressure Monitor',
    icon: 'pulse-outline',
    color: '#EF4444',
  },
  {
    id: 'pulse_oximeter',
    label: 'Pulse Oximeter',
    icon: 'water-outline',
    color: '#3B82F6',
  },
  {
    id: 'digital_stethoscope',
    label: 'Digital Stethoscope',
    icon: 'medkit-outline',
    color: '#7C3AED',
  },
  {
    id: 'thermometer',
    label: 'Thermometer',
    icon: 'thermometer-outline',
    color: '#F59E0B',
  },
  {
    id: 'ecg',
    label: 'ECG',
    icon: 'heart-outline',
    color: '#EC4899',
  },
  {
    id: 'glucometer',
    label: 'Glucometer',
    icon: 'flask-outline',
    color: '#10B981',
  },
  {
    id: 'otoscope',
    label: 'Otoscope',
    icon: 'ear-outline',
    color: '#06B6D4',
  },
  {
    id: 'weighing_scale',
    label: 'Weighing Scale',
    icon: 'speedometer-outline',
    color: '#8B5CF6',
  },
  {
    id: 'dermatoscope',
    label: 'Dermatoscope',
    icon: 'eye-outline',
    color: '#14B8A6',
  },
  {
    id: 'spirometer',
    label: 'Spirometer',
    icon: 'fitness-outline',
    color: '#F97316',
  },
  {
    id: 'ultrasound_probe',
    label: 'Ultrasound Probe',
    icon: 'scan-outline',
    color: '#0EA5E9',
  },
  {
    id: 'camera',
    label: 'Camera',
    icon: 'videocam-outline',
    color: '#94A3B8',
  },
  {
    id: 'other',
    label: 'Other Device',
    icon: 'hardware-chip-outline',
    color: '#606080',
  },
];

export function getDeviceTypeConfig(type: DeviceType): DeviceTypeConfig {
  return DEVICE_TYPES.find((dt) => dt.id === type) ?? DEVICE_TYPES[DEVICE_TYPES.length - 1];
}

export function getDeviceTypeLabel(type: DeviceType): string {
  return getDeviceTypeConfig(type).label;
}

export function getDeviceTypeIcon(type: DeviceType): string {
  return getDeviceTypeConfig(type).icon;
}
