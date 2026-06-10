import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Switch, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Habit } from '../types';
import { HabitStorage } from '../storage/storage';
import { scheduleHabitReminder, requestNotificationPermission } from '../utils/notifications';

const EMOJI_OPTIONS = ['⭐', '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎸', '🧹', '💊', '🌿', '🙏', '🚴', '🏋️', '🧠'];

export default function AddHabitScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('⭐');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [hourText, setHourText] = useState('08');
  const [minuteText, setMinuteText] = useState('00');

  async function save() {
    if (!name.trim()) return;
    const allHabits = await HabitStorage.getAll();
    const habit: Habit = {
      id: Date.now().toString(),
      name: name.trim(),
      emoji,
      reminderEnabled,
      reminderHour,
      reminderMinute,
      completionDates: [],
      createdAt: new Date().toISOString(),
    };
    await HabitStorage.save([...allHabits, habit]);

    if (reminderEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) await scheduleHabitReminder(habit);
    }

    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Habit</Text>
        <TouchableOpacity onPress={save} disabled={!name.trim()}>
          <Text style={[styles.save, !name.trim() && styles.saveDisabled]}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.label}>HABIT NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning run"
            placeholderTextColor="#636366"
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>CHOOSE AN EMOJI</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map(e => (
              <TouchableOpacity
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiOption, emoji === e && styles.emojiSelected]}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>DAILY REMINDER</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ true: '#6366F1' }}
            />
          </View>
          {reminderEnabled && (
            <View style={styles.timeRow}>
              <TextInput
                style={styles.timeInput}
                value={hourText}
                onChangeText={t => {
                  setHourText(t);
                  const n = parseInt(t);
                  if (!isNaN(n) && n >= 0 && n <= 23) setReminderHour(n);
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="HH"
                placeholderTextColor="#636366"
              />
              <Text style={styles.timeSep}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={minuteText}
                onChangeText={t => {
                  setMinuteText(t);
                  const n = parseInt(t);
                  if (!isNaN(n) && n >= 0 && n <= 59) setReminderMinute(n);
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
                placeholderTextColor="#636366"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  cancel: { fontSize: 17, color: '#8E8E93' },
  title: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  save: { fontSize: 17, fontWeight: '600', color: '#6366F1' },
  saveDisabled: { color: '#3A3A3C' },
  scroll: { padding: 20, gap: 24 },
  section: { gap: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#FFFFFF',
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiOption: { padding: 10, borderRadius: 10, backgroundColor: '#1C1C1E' },
  emojiSelected: { backgroundColor: '#3730A3' },
  emojiText: { fontSize: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInput: {
    backgroundColor: '#1C1C1E', borderRadius: 10, padding: 12,
    fontSize: 20, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', width: 60,
  },
  timeSep: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
});
