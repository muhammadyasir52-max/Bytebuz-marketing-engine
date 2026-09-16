import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CareStation, Device } from '@/types';
import { generateTagCode } from '@/utils/tagCodes';
import { getDeviceCatalogItem } from '@/constants/deviceCatalog';

export type NewCareStationInput = Pick<
  CareStation,
  'name' | 'location' | 'assignedTo' | 'status' | 'notes'
>;

export type NewDeviceInput = Pick<
  Device,
  'name' | 'type' | 'serialNumber' | 'status' | 'notes' | 'catalogId'
>;

interface CareStationsStore {
  careStations: CareStation[];

  addCareStation: (input: NewCareStationInput) => CareStation;
  updateCareStation: (id: string, partial: Partial<CareStation>) => void;
  deleteCareStation: (id: string) => void;

  addDevice: (careStationId: string, input: NewDeviceInput) => Device | undefined;
  addDevicesFromCatalog: (careStationId: string, catalogItemIds: string[]) => Device[];
  updateDevice: (careStationId: string, deviceId: string, partial: Partial<Device>) => void;
  deleteDevice: (careStationId: string, deviceId: string) => void;

  getCareStationById: (id: string) => CareStation | undefined;
}

export const useCareStationsStore = create<CareStationsStore>()(
  persist(
    (set, get) => ({
      careStations: [],

      addCareStation: (input) => {
        const now = new Date().toISOString();
        const careStation: CareStation = {
          id: Math.random().toString(36).slice(2),
          code: generateTagCode('CS'),
          devices: [],
          createdAt: now,
          updatedAt: now,
          ...input,
        };
        set((state) => ({ careStations: [...state.careStations, careStation] }));
        return careStation;
      },

      updateCareStation: (id, partial) => {
        set((state) => ({
          careStations: state.careStations.map((cs) =>
            cs.id === id
              ? { ...cs, ...partial, updatedAt: new Date().toISOString() }
              : cs,
          ),
        }));
      },

      deleteCareStation: (id) => {
        set((state) => ({
          careStations: state.careStations.filter((cs) => cs.id !== id),
        }));
      },

      addDevice: (careStationId, input) => {
        const careStation = get().careStations.find((cs) => cs.id === careStationId);
        if (!careStation) return undefined;

        const now = new Date().toISOString();
        const device: Device = {
          id: Math.random().toString(36).slice(2),
          code: generateTagCode('DV'),
          createdAt: now,
          updatedAt: now,
          ...input,
        };

        set((state) => ({
          careStations: state.careStations.map((cs) =>
            cs.id === careStationId
              ? { ...cs, devices: [...cs.devices, device], updatedAt: now }
              : cs,
          ),
        }));

        return device;
      },

      addDevicesFromCatalog: (careStationId, catalogItemIds) => {
        const careStation = get().careStations.find((cs) => cs.id === careStationId);
        if (!careStation) return [];

        const now = new Date().toISOString();
        const newDevices: Device[] = catalogItemIds
          .map((catalogId) => getDeviceCatalogItem(catalogId))
          .filter((item): item is NonNullable<typeof item> => !!item)
          .map((item) => ({
            id: Math.random().toString(36).slice(2),
            code: generateTagCode('DV'),
            name: item.name,
            type: item.type,
            status: 'active',
            catalogId: item.id,
            createdAt: now,
            updatedAt: now,
          }));

        if (newDevices.length === 0) return [];

        set((state) => ({
          careStations: state.careStations.map((cs) =>
            cs.id === careStationId
              ? { ...cs, devices: [...cs.devices, ...newDevices], updatedAt: now }
              : cs,
          ),
        }));

        return newDevices;
      },

      updateDevice: (careStationId, deviceId, partial) => {
        const now = new Date().toISOString();
        set((state) => ({
          careStations: state.careStations.map((cs) =>
            cs.id === careStationId
              ? {
                  ...cs,
                  updatedAt: now,
                  devices: cs.devices.map((d) =>
                    d.id === deviceId ? { ...d, ...partial, updatedAt: now } : d,
                  ),
                }
              : cs,
          ),
        }));
      },

      deleteDevice: (careStationId, deviceId) => {
        set((state) => ({
          careStations: state.careStations.map((cs) =>
            cs.id === careStationId
              ? {
                  ...cs,
                  updatedAt: new Date().toISOString(),
                  devices: cs.devices.filter((d) => d.id !== deviceId),
                }
              : cs,
          ),
        }));
      },

      getCareStationById: (id) => {
        return get().careStations.find((cs) => cs.id === id);
      },
    }),
    {
      name: 'care-stations-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
