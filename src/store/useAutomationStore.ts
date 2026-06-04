import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AutomationRule, QueueItem, AutomationStats } from '@/types';

interface AutomationStore {
  rules: AutomationRule[];
  queue: QueueItem[];
  stats: AutomationStats;

  // Rules
  addRule: (rule: AutomationRule) => void;
  updateRule: (id: string, partial: Partial<AutomationRule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;

  // Queue
  enqueue: (item: QueueItem) => void;
  enqueueBatch: (items: QueueItem[]) => void;
  updateQueueItem: (id: string, partial: Partial<QueueItem>) => void;
  removeQueueItem: (id: string) => void;
  clearCompleted: () => void;

  // Stats
  refreshStats: () => void;
}

export const useAutomationStore = create<AutomationStore>()(
  persist(
    (set, get) => ({
      rules: [],
      queue: [],
      stats: {
        scheduledCount: 0,
        postedThisWeek: 0,
        activeRules: 0,
        queueLength: 0,
      },

      // ─── Rules ───────────────────────────────────────────────────────────

      addRule: (rule) => {
        set((s) => ({ rules: [...s.rules, rule] }));
        get().refreshStats();
      },

      updateRule: (id, partial) => {
        set((s) => ({
          rules: s.rules.map((r) =>
            r.id === id ? { ...r, ...partial, updatedAt: new Date().toISOString() } : r
          ),
        }));
        get().refreshStats();
      },

      deleteRule: (id) => {
        set((s) => ({ rules: s.rules.filter((r) => r.id !== id) }));
        get().refreshStats();
      },

      toggleRule: (id) => {
        set((s) => ({
          rules: s.rules.map((r) =>
            r.id === id
              ? { ...r, isEnabled: !r.isEnabled, updatedAt: new Date().toISOString() }
              : r
          ),
        }));
        get().refreshStats();
      },

      // ─── Queue ───────────────────────────────────────────────────────────

      enqueue: (item) => {
        set((s) => ({ queue: [...s.queue, item] }));
        get().refreshStats();
      },

      enqueueBatch: (items) => {
        set((s) => ({ queue: [...s.queue, ...items] }));
        get().refreshStats();
      },

      updateQueueItem: (id, partial) => {
        set((s) => ({
          queue: s.queue.map((q) => (q.id === id ? { ...q, ...partial } : q)),
        }));
        get().refreshStats();
      },

      removeQueueItem: (id) => {
        set((s) => ({ queue: s.queue.filter((q) => q.id !== id) }));
        get().refreshStats();
      },

      clearCompleted: () => {
        set((s) => ({ queue: s.queue.filter((q) => q.status !== 'done') }));
        get().refreshStats();
      },

      // ─── Stats ───────────────────────────────────────────────────────────

      refreshStats: () => {
        const { rules, queue } = get();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 3_600_000);

        const postedThisWeek = queue.filter(
          (q) => q.status === 'done' && new Date(q.addedAt) >= weekAgo
        ).length;

        set({
          stats: {
            scheduledCount: queue.filter((q) => q.status === 'pending').length,
            postedThisWeek,
            activeRules: rules.filter((r) => r.isEnabled).length,
            queueLength: queue.filter((q) => q.status !== 'done').length,
          },
        });
      },
    }),
    {
      name: 'automation-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
