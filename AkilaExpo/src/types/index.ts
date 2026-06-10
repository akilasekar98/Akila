export interface Habit {
  id: string;
  name: string;
  emoji: string;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  completionDates: string[]; // ISO date strings
  createdAt: string;
}

export type AssetType = 'cash' | 'investment' | 'realEstate' | 'other' | 'liability';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type WeightUnit = 'lbs' | 'kg';

export interface WeightEntry {
  id: string;
  date: string; // ISO date string
  weight: number;
  unit: WeightUnit;
  bodyFatPercentage?: number;
  notes: string;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  cash: 'Cash & Bank',
  investment: 'Investments & Stocks',
  realEstate: 'Real Estate',
  other: 'Other Assets',
  liability: 'Liability',
};

export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  cash: '🏦',
  investment: '📈',
  realEstate: '🏠',
  other: '📦',
  liability: '💳',
};

export const ASSET_TYPE_ORDER: AssetType[] = [
  'cash',
  'investment',
  'realEstate',
  'other',
  'liability',
];
