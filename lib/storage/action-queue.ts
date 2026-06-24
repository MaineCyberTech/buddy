import { useGameStore } from '@/lib/buddy/store';

export interface QueuedAction {
  id: string;
  type: 'care' | 'adventure' | 'market' | 'trade';
  payload: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'failed';
}

const STORAGE_KEY = 'buddy-queue';
const MAX_RETRIES = 3;

function getQueue(): QueuedAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function enqueueAction(type: QueuedAction['type'], payload: unknown): void {
  const queue = getQueue();
  queue.push({
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    timestamp: Date.now(),
    retries: 0,
    maxRetries: MAX_RETRIES,
    status: 'pending',
  });
  saveQueue(queue);
}

export function getPendingActions(): QueuedAction[] {
  return getQueue().filter(a => a.status === 'pending' || a.status === 'failed');
}

export function processQueue(): void {
  const queue = getQueue();
  const online = useGameStore.getState().isOnline;
  if (!online) return;

  let changed = false;
  for (const action of queue) {
    if (action.status !== 'pending' && action.status !== 'failed') continue;
    if (action.retries >= action.maxRetries) continue;

    action.status = 'syncing';
    saveQueue(queue);

    try {
      if (action.type === 'care') {
        const { applyAction } = require('@/lib/actions/care');
        const buddy = useGameStore.getState().buddy;
        if (buddy) {
          const { buddy: updated } = applyAction(buddy, (action.payload as { action: string }).action as any);
          useGameStore.getState().updateBuddy(updated);
        }
      }
      action.status = 'syncing';
    } catch {
      action.retries++;
      action.status = 'failed';
    }
    changed = true;
  }

  if (changed) saveQueue(queue);
}

export function clearProcessedQueue(): void {
  const queue = getQueue();
  const filtered = queue.filter(a => a.status === 'failed' && a.retries < a.maxRetries);
  saveQueue(filtered);
}

export function getQueueStats(): { total: number; pending: number; failed: number; syncing: number } {
  const queue = getQueue();
  return {
    total: queue.length,
    pending: queue.filter(a => a.status === 'pending').length,
    failed: queue.filter(a => a.status === 'failed').length,
    syncing: queue.filter(a => a.status === 'syncing').length,
  };
}