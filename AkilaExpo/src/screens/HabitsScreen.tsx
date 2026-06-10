import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Habit } from '../types';
import { HabitStorage, habitStreak, isCompletedToday } from '../storage/storage';
import { scheduleHabitReminder, cancelHabitReminder } from '../utils/notifications';

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      HabitStorage.getAll().then(data =>
        setHabits([...data].sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
      );
    }, [])
  );

  async function toggleHabit(habit: Habit) {
    const today = new Date().toISOString();
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const updatedDates = isCompletedToday(habit)
      ? habit.completionDates.filter(d => {
          const dt = new Date(d); dt.setHours(0, 0, 0, 0);
          return dt.getTime() !== todayDate.getTime();
        })
      : [...habit.completionDates, today];

    const updated = habits.map(h =>
      h.id === habit.id ? { ...h, completionDates: updatedDates } : h
    );
    setHabits(updated);
    await HabitStorage.save(updated);
  }

  async function deleteHabit(id: string) {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await cancelHabitReminder(id);
          const updated = habits.filter(h => h.id !== id);
          setHabits(updated);
          await HabitStorage.save(updated);
        },
      },
    ]);
  }

  const completedCount = habits.filter(isCompletedToday).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddHabit')}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {habits.length > 0 && (
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            {completedCount}/{habits.length} completed today
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${habits.length ? (completedCount / habits.length) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>
      )}

      <FlatList
        data={habits}
        keyExtractor={h => h.id}
        contentContainerStyle={habits.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No Habits Yet</Text>
            <Text style={styles.emptySubtitle}>Tap "+ Add" to create your first habit</Text>
          </View>
        }
        renderItem={({ item }) => {
          const done = isCompletedToday(item);
          const streak = habitStreak(item);
          return (
            <View style={styles.habitCard}>
              <TouchableOpacity onPress={() => toggleHabit(item)} style={styles.checkbox}>
                <Text style={styles.checkboxIcon}>{done ? '✅' : '⭕'}</Text>
              </TouchableOpacity>
              <Text style={styles.habitEmoji}>{item.emoji}</Text>
              <View style={styles.habitInfo}>
                <Text style={[styles.habitName, done && styles.habitDone]}>{item.name}</Text>
                {streak > 0 && (
                  <Text style={styles.streak}>🔥 {streak} day streak</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => deleteHabit(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteIcon}>🗑</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#6366F1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  progress: { paddingHorizontal: 20, marginBottom: 12 },
  progressText: { color: '#8E8E93', fontSize: 13, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: '#2C2C2E', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 3 },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
  habitCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E',
    borderRadius: 14, padding: 14, gap: 10,
  },
  checkbox: { padding: 2 },
  checkboxIcon: { fontSize: 22 },
  habitEmoji: { fontSize: 22 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
  habitDone: { color: '#636366', textDecorationLine: 'line-through' },
  streak: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
});
