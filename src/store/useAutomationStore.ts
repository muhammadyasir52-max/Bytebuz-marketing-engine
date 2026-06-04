import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AutomationRule, AutomationRun } from '@/types';

const MAX_RUNS_STORED = 50;

interface AutomationStore {
  rules: AutomationRule[];
  runs: AutomationRun[];

  addRule: (rule: AutomationRule) => void;
  updateRule: (id: string, partial: Partial<AutomationRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;

  addRun: (run: AutomationRun) => void;
  updateRun: (id: string, partial: Partial<AutomationRun>) => void;

  getRunsByRule: (ruleId: string) => AutomationRun[];
  getRecentRuns: (limit?: number) => AutomationRun[];
}

export const useAutomationStore = create<AutomationStore>()(
  persist(
    (set, get) => ({
      rules: [],
      runs: [],

      addRule: (rule) =>
        set((state) => ({ rules: [...state.rules, rule] })),

      updateRule: (id, partial) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, ...partial, updatedAt: new Date().toISOString() } : r,
          ),
        })),

      deleteRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
          runs: state.runs.filter((run) => run.ruleId !== id),
        })),

      toggleRule: (id) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: r.status === 'active' ? 'paused' : 'active',
                  updatedAt: new Date().toISOString(),
                }
              : r,
          ),
        })),

      addRun: (run) =>
        set((state) => {
          const runs = [run, ...state.runs].slice(0, MAX_RUNS_STORED);
          return { runs };
        }),

      updateRun: (id, partial) =>
        set((state) => ({
          runs: state.runs.map((r) => (r.id === id ? { ...r, ...partial } : r)),
        })),

      getRunsByRule: (ruleId) => get().runs.filter((r) => r.ruleId === ruleId),

      getRecentRuns: (limit = 10) => get().runs.slice(0, limit),
    }),
    {
      name: 'automation-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
