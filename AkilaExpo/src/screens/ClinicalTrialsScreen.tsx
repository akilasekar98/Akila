import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { searchClinicalTrials, ClinicalTrial } from '../utils/clinicalTrialsApi';

const COLUMNS: { key: keyof ClinicalTrial; label: string }[] = [
  { key: 'nctId', label: 'NCT ID' },
  { key: 'briefTitle', label: 'Brief Title' },
  { key: 'officialTitle', label: 'Official Title' },
  { key: 'overallStatus', label: 'Status' },
  { key: 'phase', label: 'Phase' },
  { key: 'studyType', label: 'Study Type' },
  { key: 'conditions', label: 'Conditions' },
  { key: 'interventions', label: 'Interventions' },
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'completionDate', label: 'Completion Date' },
  { key: 'enrollment', label: 'Enrollment' },
  { key: 'briefSummary', label: 'Brief Summary' },
  { key: 'locations', label: 'Locations' },
  { key: 'eligibilityCriteria', label: 'Eligibility Criteria' },
  { key: 'primaryOutcomes', label: 'Primary Outcomes' },
  { key: 'contactName', label: 'Contact Name' },
  { key: 'contactPhone', label: 'Contact Phone' },
  { key: 'contactEmail', label: 'Contact Email' },
  { key: 'lastUpdateDate', label: 'Last Updated' },
  { key: 'url', label: 'URL' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ClinicalTrialsScreen() {
  const [query, setQuery] = useState('');
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);

  async function handleSearch() {
    if (!query.trim()) {
      Alert.alert('Enter a search term', 'Please type a condition, drug, or keyword to search.');
      return;
    }
    setLoading(true);
    setTrials([]);
    try {
      const results = await searchClinicalTrials(query.trim(), pageSize);
      setTrials(results);
      if (results.length === 0) {
        Alert.alert('No results', 'No clinical trials found for that search.');
      }
    } catch (err: any) {
      Alert.alert('Search failed', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (trials.length === 0) {
      Alert.alert('Nothing to export', 'Run a search first.');
      return;
    }
    setExporting(true);
    try {
      const rows = trials.map((t) => {
        const row: Record<string, string> = {};
        COLUMNS.forEach(({ key, label }) => {
          row[label] = t[key] ?? '';
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((c) => c.label) });

      // Auto-size columns
      const colWidths = COLUMNS.map(({ label }) => {
        const maxLen = Math.max(
          label.length,
          ...rows.map((r) => Math.min((r[label] ?? '').length, 80))
        );
        return { wch: maxLen + 2 };
      });
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Clinical Trials');

      const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileName = `clinical_trials_${query.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
      const file = new File(Paths.document, fileName);
      file.write(base64, { encoding: 'base64' });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Export Clinical Trials',
          UTI: 'com.microsoft.excel.xlsx',
        });
      } else {
        Alert.alert('Saved', `File saved to:\n${file.uri}`);
      }
    } catch (err: any) {
      Alert.alert('Export failed', err?.message ?? 'Unknown error');
    } finally {
      setExporting(false);
    }
  }

  function statusColor(status: string) {
    const s = status.toLowerCase();
    if (s.includes('recruiting')) return '#34C759';
    if (s.includes('completed')) return '#636366';
    if (s.includes('active')) return '#6366F1';
    if (s.includes('terminated') || s.includes('withdrawn')) return '#FF3B30';
    return '#FF9500';
  }

  function renderTrialCard({ item }: { item: ClinicalTrial }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelectedTrial(item)} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <Text style={styles.nctId}>{item.nctId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(item.overallStatus) + '22', borderColor: statusColor(item.overallStatus) }]}>
            <Text style={[styles.statusText, { color: statusColor(item.overallStatus) }]}>{item.overallStatus}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.briefTitle}</Text>
        <View style={styles.cardMeta}>
          {item.phase ? <Text style={styles.metaTag}>{item.phase}</Text> : null}
          {item.studyType ? <Text style={styles.metaTag}>{item.studyType}</Text> : null}
          {item.enrollment ? <Text style={styles.metaTag}>n={item.enrollment}</Text> : null}
        </View>
        {item.conditions ? (
          <Text style={styles.conditions} numberOfLines={1}>
            <Text style={styles.metaLabel}>Conditions: </Text>{item.conditions}
          </Text>
        ) : null}
        {item.sponsor ? (
          <Text style={styles.sponsor} numberOfLines={1}>
            <Text style={styles.metaLabel}>Sponsor: </Text>{item.sponsor}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Clinical Trials</Text>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search condition, drug, sponsor..."
          placeholderTextColor="#636366"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Page size picker */}
      <View style={styles.pageSizeRow}>
        <Text style={styles.pageSizeLabel}>Results:</Text>
        {PAGE_SIZE_OPTIONS.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.pageSizeChip, pageSize === n && styles.pageSizeChipActive]}
            onPress={() => setPageSize(n)}
          >
            <Text style={[styles.pageSizeChipText, pageSize === n && styles.pageSizeChipTextActive]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results count + export */}
      {trials.length > 0 && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsCount}>{trials.length} results</Text>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport} disabled={exporting}>
            {exporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.exportButtonText}>Export Excel</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Searching ClinicalTrials.gov…</Text>
        </View>
      )}

      {/* List */}
      {!loading && (
        <FlatList
          data={trials}
          keyExtractor={(item) => item.nctId}
          renderItem={renderTrialCard}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {trials.length === 0 ? 'Search for clinical trials above.' : ''}
            </Text>
          }
        />
      )}

      {/* Detail modal */}
      <Modal visible={!!selectedTrial} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedTrial && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalNctId}>{selectedTrial.nctId}</Text>
                    <TouchableOpacity onPress={() => setSelectedTrial(null)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalTitle}>{selectedTrial.briefTitle}</Text>
                  {COLUMNS.filter((c) => c.key !== 'nctId' && c.key !== 'briefTitle').map(({ key, label }) =>
                    selectedTrial[key] ? (
                      <View key={key} style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{label}</Text>
                        <Text style={styles.detailValue}>{selectedTrial[key]}</Text>
                      </View>
                    ) : null
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  heading: { fontSize: 28, fontWeight: '700', color: '#fff', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  input: {
    flex: 1, backgroundColor: '#1C1C1E', color: '#fff', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#2C2C2E',
  },
  searchButton: {
    backgroundColor: '#6366F1', borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center',
  },
  searchButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  pageSizeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  pageSizeLabel: { color: '#636366', fontSize: 13 },
  pageSizeChip: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
    backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E',
  },
  pageSizeChipActive: { backgroundColor: '#6366F122', borderColor: '#6366F1' },
  pageSizeChipText: { color: '#636366', fontSize: 13 },
  pageSizeChipTextActive: { color: '#6366F1', fontWeight: '600' },
  resultsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  resultsCount: { color: '#636366', fontSize: 13 },
  exportButton: {
    backgroundColor: '#34C759', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, minWidth: 110, alignItems: 'center',
  },
  exportButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#2C2C2E',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  nctId: { color: '#6366F1', fontWeight: '700', fontSize: 13 },
  statusBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: '600' },
  title: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 6, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  metaTag: {
    backgroundColor: '#2C2C2E', color: '#aeaeb2', fontSize: 11,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  metaLabel: { color: '#636366', fontSize: 12 },
  conditions: { color: '#aeaeb2', fontSize: 12, marginTop: 2 },
  sponsor: { color: '#aeaeb2', fontSize: 12, marginTop: 2 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  loadingText: { color: '#636366', marginTop: 12, fontSize: 14 },
  emptyText: { color: '#636366', textAlign: 'center', marginTop: 40, fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  modalNctId: { color: '#6366F1', fontWeight: '700', fontSize: 14 },
  modalClose: { color: '#636366', fontSize: 20, fontWeight: '600' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16, lineHeight: 22 },
  detailRow: { marginBottom: 12 },
  detailLabel: { color: '#636366', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  detailValue: { color: '#aeaeb2', fontSize: 13, lineHeight: 18 },
});
