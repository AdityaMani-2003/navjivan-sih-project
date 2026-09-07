import AsyncStorage from '@react-native-async-storage/async-storage';
import API from './api';

export interface QueuedAction {
  id: string;
  type: 'LOG_CRAVING' | 'SYNC_STEPS' | 'LOG_MEAL' | 'UPDATE_GOAL' | 'EARN_XP';
  payload: any;
  timestamp: string;
}

const STORAGE_KEY = '@lastpuff_offline_queue';

export const enqueueAction = async (
  type: QueuedAction['type'],
  payload: any
): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const queue: QueuedAction[] = raw ? JSON.parse(raw) : [];

    const newAction: QueuedAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    queue.push(newAction);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('OfflineQueue enqueue error:', err);
  }
};

export const getQueuedActions = async (): Promise<QueuedAction[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const flushQueue = async (): Promise<number> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;

    const queue: QueuedAction[] = JSON.parse(raw);
    if (queue.length === 0) return 0;

    let processedCount = 0;
    const remainingQueue: QueuedAction[] = [];

    for (const action of queue) {
      try {
        switch (action.type) {
          case 'LOG_CRAVING':
            await API.post('/api/sos/log-craving', action.payload);
            break;
          case 'SYNC_STEPS':
            await API.post('/api/steps/sync', action.payload);
            break;
          case 'LOG_MEAL':
            await API.post('/api/nutrition/log', action.payload);
            break;
          case 'UPDATE_GOAL':
            await API.patch(`/api/goals/${action.payload.id}`, action.payload.data);
            break;
          case 'EARN_XP':
            await API.post('/api/rewards/earn-xp', action.payload);
            break;
        }
        processedCount++;
      } catch (e) {
        // Keep failed item to retry later
        remainingQueue.push(action);
      }
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remainingQueue));
    return processedCount;
  } catch (err) {
    console.error('OfflineQueue flush error:', err);
    return 0;
  }
};
