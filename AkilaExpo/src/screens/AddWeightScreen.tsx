import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WeightEntry, WeightUnit } from '../types';
import { WeightStorage } from '../storage/storage';

export default function AddWeightScreen() {
  const navigation = useNavigation();
  const [weightText, setWeightText] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('lbs');
  const [includeBodyFat, setIncludeBodyFat] = useState(false);
  const [bodyFatText, setBodyFatText] = useState('');
  const [notes, setNotes] = useState('');
  const [date] = useState(new Date().toISOString().split('T')[0]);

  const isValid = !isNaN(parseFloat(weightText)) && parseFloat(weightText) > 0;

  async function save() {
    if (!isValid) return;
    const all = await WeightStorage.getAll();
    const entry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight: parseFloat(weightText),
      unit,
      bodyFatPercentage: includeBodyFat && bodyFatText ? parseFloat(bodyFatText) : undefined,
      notes,
    };
    await WeightStorage.save([...all, entry]);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log Weight</Text>
        <TouchableOpacity onPress={save} disabled={!isValid}>
          <Text style={[styles.save, !isValid && styles.saveDisabled]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.label}>WEIGHT</Text>
          <View style={styles.weightRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="0.0"
              placeholderTextColor="#636366"
              value={weightText}
              onChangeText={setWeightText}
              keyboardType="decimal-pad"
              autoFocus
            />
            <View style={styles.unitToggle}>
              {(['lbs', 'kg'] as WeightUnit[]).map(u => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnit(u)}
                  style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                >
                  <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>BODY FAT %</Text>
            <Switch
              value={includeBodyFat}
              onValueChange={setIncludeBodyFat}
              trackColor={{ true: '#EC4899' }}
            />
          </View>
          {includeBodyFat && (
            <TextInput
              style={styles.input}
              placeholder="e.g. 18.5"
              placeholderTextColor="#636366"
              value={bodyFatText}
              onChangeText={setBodyFatText}
              keyboardType="decimal-pad"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>NOTES (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="How are you feeling?"
            placeholderTextColor="#636366"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
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
  save: { fontSize: 17, fontWeight: '600', color: '#EC4899' },
  saveDisabled: { color: '#3A3A3C' },
  scroll: { padding: 20, gap: 24 },
  section: { gap: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5 },
  input: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, fontSize: 16, color: '#FFFFFF' },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  weightRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  unitToggle: { flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 10, overflow: 'hidden' },
  unitBtn: { paddingHorizontal: 18, paddingVertical: 14 },
  unitBtnActive: { backgroundColor: '#EC4899' },
  unitBtnText: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  unitBtnTextActive: { color: '#FFFFFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
