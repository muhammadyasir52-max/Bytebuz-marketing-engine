import { DeviceType } from '@/types';

export interface DeviceCatalogItem {
  id: string;
  brand: string;
  model: string;
  name: string;
  type: DeviceType;
}

/**
 * The standard set of devices that go into each care station briefcase.
 * Append new models here as the kit grows — the catalog picker and
 * "Add Standard Devices" flow pick this list up automatically.
 */
export const DEVICE_CATALOG: DeviceCatalogItem[] = [
  {
    id: 'sonostar-cprobe-7c',
    brand: 'Sonostar',
    model: 'CProbe-7C',
    name: 'Sonostar CProbe-7C Convex Probe',
    type: 'ultrasound_probe',
  },
  {
    id: 'fingertip-oximeter-pc-60fw',
    brand: 'Fingertip',
    model: 'PC-60FW',
    name: 'Fingertip Oximeter PC-60FW',
    type: 'pulse_oximeter',
  },
  {
    id: 'infrared-thermometer-det-1015b',
    brand: 'Infrared',
    model: 'DET-1015B',
    name: 'Infrared Thermometer DET-1015B',
    type: 'thermometer',
  },
  {
    id: 'razer-kiyo-camera',
    brand: 'Razer',
    model: 'Kiyo',
    name: 'Razer Kiyo Camera',
    type: 'camera',
  },
  {
    id: 'alphamed-bp-u807',
    brand: 'Alphamed',
    model: 'U807',
    name: 'Alphamed Bluetooth Blood Pressure U807',
    type: 'blood_pressure_monitor',
  },
  {
    id: 'soundlink-otoscope-sot-100',
    brand: 'Soundlink',
    model: 'SOT-100',
    name: 'Soundlink Otoscope SOT-100',
    type: 'otoscope',
  },
  {
    id: 'mintti-smartho-d2',
    brand: 'Mintti',
    model: 'Smartho-D2',
    name: 'Mintti Smartho D2',
    type: 'digital_stethoscope',
  },
];

export function getDeviceCatalogItem(id: string): DeviceCatalogItem | undefined {
  return DEVICE_CATALOG.find((item) => item.id === id);
}
