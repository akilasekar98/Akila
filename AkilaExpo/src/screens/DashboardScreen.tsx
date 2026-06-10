import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Habit, Asset, WeightEntry } from '../types';
import { HabitStorage, AssetStorage, WeightStorage, habitStreak, isCompletedToday } from '../storage/storage';
import SummaryCard from '../components/SummaryCard';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function DashboardScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      HabitStorage.getAll().then(setHabits);
      AssetStorage.getAll().then(setAssets);
      WeightStorage.getAll().then(entries =>
        setWeightEntries([...entries].sort((a, b) => b.date.localeCompare(a.date)))
      );
    }, [])
  );

  const completedToday = habits.filter(isCompletedToday).length;
  const netWorth = assets.reduce((sum, a) => a.type === 'liability' ? sum - a.value : sum + a.value, 0);
  const latestWeight = weightEntries[0];
  const bestStreak = habits.reduce((max, h) => Math.max(max, habitStreak(h)), 0);
  const bestHabit = habits.find(h => habitStreak(h) === bestStreak);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.title}>Here's your overview</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.row}>
            <SummaryCard
              title="Habits Today"
              value={`${completedToday}/${habits.length}`}
              subtitle={habits.length === 0 ? 'No habits yet' : completedToday === habits.length ? 'All done! 🎉' : `${habits.length - completedToday} remaining`}
              icon="✅"
              color="#6366F1"
            />
            <View style={{ width: 12 }} />
            <SummaryCard
              title="Net Worth"
              value={formatCurrency(netWorth)}
              subtitle={`${assets.length} assets tracked`}
              icon="💰"
              color={netWorth >= 0 ? '#10B981' : '#EF4444'}
            />
          </View>
          <View style={[styles.row, { marginTop: 12 }]}>
            <SummaryCard
              title="Weight"
              value={latestWeight ? `${latestWeight.weight.toFixed(1)} ${latestWeight.unit}` : '—'}
              subtitle={latestWeight ? `Logged ${new Date(latestWeight.date).toLocaleDateString()}` : 'No entries yet'}
              icon="❤️"
              color="#EC4899"
            />
            <View style={{ width: 12 }} />
            <SummaryCard
              title="Best Streak"
              value={bestStreak > 0 ? `${bestStreak} days` : '—'}
              subtitle={bestHabit?.name ?? 'No habits yet'}
              icon="🔥"
              color="#F97316"
            />
          </View>
        </View>

        {habits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            {habits.slice(0, 6).map(habit => {
              const done = isCompletedToday(habit);
              return (
                <View key={habit.id} style={styles.habitRow}>
                  <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                  <Text style={[styles.habitName, done && styles.habitDone]}>{habit.name}</Text>
                  <Text style={styles.habitCheck}>{done ? '✅' : '⭕'}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000000' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 16, color: '#8E8E93', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  grid: { marginBottom: 24 },
  row: { flexDirection: 'row' },
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  habitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  habitEmoji: { fontSize: 20, marginRight: 12 },
  habitName: { flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  habitDone: { color: '#636366', textDecorationLine: 'line-through' },
  habitCheck: { fontSize: 18 },
});
