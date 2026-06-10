import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Asset, AssetType, ASSET_TYPE_LABELS, ASSET_TYPE_ICONS, ASSET_TYPE_ORDER } from '../types';
import { AssetStorage } from '../storage/storage';

export default function AddAssetScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const existing: Asset | undefined = route.params?.asset;

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<AssetType>(existing?.type ?? 'cash');
  const [valueText, setValueText] = useState(existing ? String(existing.value) : '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const isValid = name.trim().length > 0 && !isNaN(parseFloat(valueText)) && parseFloat(valueText) >= 0;

  async function save() {
    if (!isValid) return;
    const all = await AssetStorage.getAll();
    const value = parseFloat(valueText);

    if (existing) {
      const updated = all.map(a =>
        a.id === existing.id
          ? { ...a, name: name.trim(), type, value, notes, updatedAt: new Date().toISOString() }
          : a
      );
      await AssetStorage.save(updated);
    } else {
      const asset: Asset = {
        id: Date.now().toString(),
        name: name.trim(),
        type,
        value,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await AssetStorage.save([...all, asset]);
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{existing ? 'Edit Asset' : 'New Asset'}</Text>
        <TouchableOpacity onPress={save} disabled={!isValid}>
          <Text style={[styles.save, !isValid && styles.saveDisabled]}>
            {existing ? 'Save' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.label}>ASSET NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Chase Checking"
            placeholderTextColor="#636366"
            value={name}
            onChangeText={setName}
            autoFocus={!existing}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>TYPE</Text>
          <View style={styles.typeGrid}>
            {ASSET_TYPE_ORDER.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[styles.typeOption, type === t && styles.typeSelected]}
              >
                <Text style={styles.typeIcon}>{ASSET_TYPE_ICONS[t]}</Text>
                <Text style={[styles.typeLabel, type === t && styles.typeLabelSelected]}>
                  {ASSET_TYPE_LABELS[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>VALUE ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#636366"
            value={valueText}
            onChangeText={setValueText}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>NOTES (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add a note..."
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
  save: { fontSize: 17, fontWeight: '600', color: '#10B981' },
  saveDisabled: { color: '#3A3A3C' },
  scroll: { padding: 20, gap: 24 },
  section: { gap: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5 },
  input: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, fontSize: 16, color: '#FFFFFF' },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  typeGrid: { gap: 8 },
  typeOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E',
    borderRadius: 12, padding: 14, gap: 12,
  },
  typeSelected: { backgroundColor: '#1a1a3e', borderWidth: 1, borderColor: '#6366F1' },
  typeIcon: { fontSize: 20 },
  typeLabel: { fontSize: 15, color: '#8E8E93', fontWeight: '500' },
  typeLabelSelected: { color: '#FFFFFF' },
});
