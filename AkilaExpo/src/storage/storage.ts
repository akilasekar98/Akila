import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, Asset, WeightEntry } from '../types';

const KEYS = {
  HABITS: 'akila_habits',
  ASSETS: 'akila_assets',
  WEIGHT: 'akila_weight',
};

async function load<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function save<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export const HabitStorage = {
  getAll: () => load<Habit>(KEYS.HABITS),
  save: (habits: Habit[]) => save(KEYS.HABITS, habits),
};

export const AssetStorage = {
  getAll: () => load<Asset>(KEYS.ASSETS),
  save: (assets: Asset[]) => save(KEYS.ASSETS, assets),
};

export const WeightStorage = {
  getAll: () => load<WeightEntry>(KEYS.WEIGHT),
  save: (entries: WeightEntry[]) => save(KEYS.WEIGHT, entries),
};

export function habitStreak(habit: Habit): number {
  if (!habit.completionDates.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sorted = [...habit.completionDates]
    .map(d => { const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt.getTime(); })
    .sort((a, b) => b - a)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const todayMs = today.getTime();
  const dayMs = 86400000;
  const isCompletedToday = sorted[0] === todayMs;
  let streak = 0;
  let checkMs = isCompletedToday ? todayMs : todayMs - dayMs;

  for (const dateMs of sorted) {
    if (dateMs === checkMs) {
      streak++;
      checkMs -= dayMs;
    } else if (dateMs < checkMs) {
      break;
    }
  }
  return streak;
}

export function isCompletedToday(habit: Habit): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return habit.completionDates.some(d => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt.getTime() === today.getTime();
  });
}
