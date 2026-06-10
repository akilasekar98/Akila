import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, useWindowDimensions, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { WeightEntry } from '../types';
import { WeightStorage } from '../storage/storage';
import LineChart from '../components/LineChart';

type Range = '1W' | '1M' | '3M' | 'All';

function filterByRange(entries: WeightEntry[], range: Range): WeightEntry[] {
  if (range === 'All') return entries;
  const days = range === '1W' ? 7 : range === '1M' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return entries.filter(e => new Date(e.date) >= cutoff);
}

export default function HealthScreen() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [range, setRange] = useState<Range>('1M');
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      WeightStorage.getAll().then(data =>
        setEntries([...data].sort((a, b) => b.date.localeCompare(a.date)))
      );
    }, [])
  );

  async function deleteEntry(id: string) {
    Alert.alert('Delete Entry', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = entries.filter(e => e.id !== id);
          setEntries(updated);
          await WeightStorage.save(updated);
        },
      },
    ]);
  }

  const latest = entries[0];
  const chartData = filterByRange(entries, range).reverse();
  const change = entries.length >= 2 ? entries[0].weight - entries[entries.length - 1].weight : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Health</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddWeight')}
        >
          <Text style={styles.addBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={e => e.id}
        contentContainerStyle={entries.length === 0 ? styles.emptyContainer : styles.list}
        ListHeaderComponent={
          <>
            {latest && (
              <View style={styles.statsCard}>
                <View style={styles.statsRow}>
                  <View>
                    <Text style={styles.statsLabel}>Current Weight</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                      <Text style={styles.weightValue}>{latest.weight.toFixed(1)}</Text>
                      <Text style={styles.weightUnit}>{latest.unit}</Text>
                    </View>
                  </View>
                  {change !== null && Math.abs(change) > 0.01 && (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.statsLabel}>Total Change</Text>
                      <Text style={[styles.changeValue, { color: change < 0 ? '#10B981' : '#F97316' }]}>
                        {change < 0 ? '↓' : '↑'} {Math.abs(change).toFixed(1)} {latest.unit}
                      </Text>
                    </View>
                  )}
                </View>

                {chartData.length >= 2 && (
                  <View style={styles.chartSection}>
                    <View style={styles.rangeRow}>
                      {(['1W', '1M', '3M', 'All'] as Range[]).map(r => (
                        <TouchableOpacity
                          key={r}
                          onPress={() => setRange(r)}
                          style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
                        >
                          <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>{r}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <LineChart
                      data={chartData.map(e => ({ value: e.weight }))}
                      color="#EC4899"
                      height={160}
                      width={width - 72}
                    />
                  </View>
                )}
              </View>
            )}

            {entries.length > 0 && (
              <Text style={styles.historyLabel}>HISTORY</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⚖️</Text>
            <Text style={styles.emptyTitle}>No Entries Yet</Text>
            <Text style={styles.emptySubtitle}>Tap "+ Log" to record your first weight</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.entryCard}
            onLongPress={() => deleteEntry(item.id)}
          >
            <View>
              <Text style={styles.entryDate}>
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              {item.notes ? <Text style={styles.entryNotes}>{item.notes}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.entryWeight}>{item.weight.toFixed(1)} {item.unit}</Text>
              {item.bodyFatPercentage != null && (
                <Text style={styles.entryBF}>{item.bodyFatPercentage.toFixed(1)}% BF</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#EC4899', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  list: { padding: 16, paddingTop: 0 },
  emptyContainer: { flex: 1 },
  statsCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  statsLabel: { fontSize: 13, color: '#8E8E93', marginBottom: 4 },
  weightValue: { fontSize: 40, fontWeight: '700', color: '#FFFFFF' },
  weightUnit: { fontSize: 18, color: '#8E8E93' },
  changeValue: { fontSize: 18, fontWeight: '600' },
  chartSection: { gap: 12 },
  rangeRow: { flexDirection: 'row', gap: 8 },
  rangeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#2C2C2E' },
  rangeBtnActive: { backgroundColor: '#EC4899' },
  rangeBtnText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  rangeBtnTextActive: { color: '#FFFFFF' },
  historyLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5, marginBottom: 10 },
  entryCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 8,
  },
  entryDate: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  entryNotes: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  entryWeight: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  entryBF: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#8E8E93' },
});
