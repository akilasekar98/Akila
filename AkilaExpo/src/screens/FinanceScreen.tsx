import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, SectionList,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Asset, AssetType, ASSET_TYPE_LABELS, ASSET_TYPE_ICONS, ASSET_TYPE_ORDER } from '../types';
import { AssetStorage } from '../storage/storage';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function FinanceScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      AssetStorage.getAll().then(setAssets);
    }, [])
  );

  async function deleteAsset(id: string) {
    Alert.alert('Delete Asset', 'Remove this asset?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = assets.filter(a => a.id !== id);
          setAssets(updated);
          await AssetStorage.save(updated);
        },
      },
    ]);
  }

  const netWorth = assets.reduce((sum, a) => a.type === 'liability' ? sum - a.value : sum + a.value, 0);
  const totalAssets = assets.filter(a => a.type !== 'liability').reduce((s, a) => s + a.value, 0);
  const totalLiabilities = assets.filter(a => a.type === 'liability').reduce((s, a) => s + a.value, 0);

  const sections = ASSET_TYPE_ORDER
    .map(type => ({ title: type, data: assets.filter(a => a.type === type) }))
    .filter(s => s.data.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Finance</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddAsset')}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.netWorthCard}>
        <Text style={styles.netWorthLabel}>Net Worth</Text>
        <Text style={[styles.netWorthValue, { color: netWorth >= 0 ? '#10B981' : '#EF4444' }]}>
          {formatCurrency(netWorth)}
        </Text>
        <View style={styles.netWorthRow}>
          <View style={styles.netWorthStat}>
            <Text style={styles.netWorthStatLabel}>Assets</Text>
            <Text style={styles.netWorthStatValue}>{formatCurrency(totalAssets)}</Text>
          </View>
          <View style={styles.netWorthDivider} />
          <View style={styles.netWorthStat}>
            <Text style={styles.netWorthStatLabel}>Liabilities</Text>
            <Text style={[styles.netWorthStatValue, { color: '#EF4444' }]}>{formatCurrency(totalLiabilities)}</Text>
          </View>
        </View>
      </View>

      {assets.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyTitle}>No Assets Yet</Text>
          <Text style={styles.emptySubtitle}>Tap "+ Add" to track your first asset</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{ASSET_TYPE_ICONS[title as AssetType]}</Text>
              <Text style={styles.sectionTitle}>{ASSET_TYPE_LABELS[title as AssetType]}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.assetCard}
              onPress={() => navigation.navigate('AddAsset', { asset: item })}
              onLongPress={() => deleteAsset(item.id)}
            >
              <View style={styles.assetInfo}>
                <Text style={styles.assetName}>{item.name}</Text>
                {item.notes ? <Text style={styles.assetNotes}>{item.notes}</Text> : null}
              </View>
              <Text style={[styles.assetValue, item.type === 'liability' && styles.liability]}>
                {formatCurrency(item.value)}
              </Text>
            </TouchableOpacity>
          )}
          renderSectionFooter={({ section: { title, data } }) => {
            const subtotal = data.reduce((s, a) => s + a.value, 0);
            return (
              <Text style={styles.subtotal}>
                Subtotal: {formatCurrency(subtotal)}
              </Text>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  netWorthCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20 },
  netWorthLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  netWorthValue: { fontSize: 36, fontWeight: '700', marginBottom: 16 },
  netWorthRow: { flexDirection: 'row', alignItems: 'center' },
  netWorthStat: { flex: 1, alignItems: 'center' },
  netWorthStatLabel: { fontSize: 12, color: '#8E8E93', marginBottom: 2 },
  netWorthStatValue: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  netWorthDivider: { width: 1, height: 32, backgroundColor: '#2C2C2E' },
  list: { padding: 16, paddingTop: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 6 },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  assetCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E',
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  assetNotes: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  assetValue: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  liability: { color: '#EF4444' },
  subtotal: { fontSize: 12, color: '#636366', textAlign: 'right', marginBottom: 12, paddingRight: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#8E8E93' },
});
