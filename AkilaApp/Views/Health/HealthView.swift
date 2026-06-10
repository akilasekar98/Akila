import SwiftUI
import SwiftData
import Charts

struct HealthView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \WeightEntry.date, order: .reverse) private var entries: [WeightEntry]
    @State private var showingAddEntry = false
    @State private var selectedRange: ChartRange = .month

    enum ChartRange: String, CaseIterable {
        case week = "1W"
        case month = "1M"
        case threeMonths = "3M"
        case all = "All"

        var days: Int? {
            switch self {
            case .week: return 7
            case .month: return 30
            case .threeMonths: return 90
            case .all: return nil
            }
        }
    }

    private var chartEntries: [WeightEntry] {
        guard let days = selectedRange.days else { return entries }
        let cutoff = Calendar.current.date(byAdding: .day, value: -days, to: Date())!
        return entries.filter { $0.date >= cutoff }
    }

    private var latestEntry: WeightEntry? { entries.first }
    private var earliestInRange: WeightEntry? { chartEntries.last }

    private var weightChange: Double? {
        guard let latest = latestEntry, let earliest = earliestInRange, latest.id != earliest.id else { return nil }
        return latest.weight - earliest.weight
    }

    var body: some View {
        NavigationStack {
            List {
                if let latest = latestEntry {
                    Section {
                        HStack(alignment: .bottom, spacing: 8) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Current Weight")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                HStack(alignment: .lastTextBaseline, spacing: 4) {
                                    Text(String(format: "%.1f", latest.weight))
                                        .font(.largeTitle)
                                        .fontWeight(.bold)
                                    Text(latest.unit.rawValue)
                                        .font(.title3)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            Spacer()
                            if let change = weightChange {
                                VStack(alignment: .trailing, spacing: 4) {
                                    Text("Change")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    HStack(spacing: 2) {
                                        Image(systemName: change < 0 ? "arrow.down" : "arrow.up")
                                        Text(String(format: "%.1f %@", abs(change), latest.unit.rawValue))
                                    }
                                    .fontWeight(.semibold)
                                    .foregroundStyle(change < 0 ? .green : .orange)
                                }
                            }
                        }
                        .padding(.vertical, 4)

                        if chartEntries.count >= 2 {
                            VStack(alignment: .leading, spacing: 8) {
                                Picker("Range", selection: $selectedRange) {
                                    ForEach(ChartRange.allCases, id: \.self) { range in
                                        Text(range.rawValue).tag(range)
                                    }
                                }
                                .pickerStyle(.segmented)

                                Chart(chartEntries.reversed()) { entry in
                                    LineMark(
                                        x: .value("Date", entry.date),
                                        y: .value("Weight", entry.weight)
                                    )
                                    .foregroundStyle(.pink)
                                    .interpolationMethod(.catmullRom)

                                    AreaMark(
                                        x: .value("Date", entry.date),
                                        y: .value("Weight", entry.weight)
                                    )
                                    .foregroundStyle(.pink.opacity(0.15))
                                    .interpolationMethod(.catmullRom)

                                    PointMark(
                                        x: .value("Date", entry.date),
                                        y: .value("Weight", entry.weight)
                                    )
                                    .foregroundStyle(.pink)
                                    .symbolSize(30)
                                }
                                .frame(height: 180)
                                .chartXAxis {
                                    AxisMarks(values: .automatic(desiredCount: 4)) { _ in
                                        AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }

                if entries.isEmpty {
                    Section {
                        ContentUnavailableView(
                            "No Entries Yet",
                            systemImage: "scalemass",
                            description: Text("Tap + to log your first weight entry")
                        )
                    }
                } else {
                    Section("History") {
                        ForEach(entries) { entry in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(entry.date.formatted(date: .abbreviated, time: .omitted))
                                        .fontWeight(.medium)
                                    if !entry.notes.isEmpty {
                                        Text(entry.notes)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                Spacer()
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text("\(String(format: "%.1f", entry.weight)) \(entry.unit.rawValue)")
                                        .fontWeight(.semibold)
                                    if let bf = entry.bodyFatPercentage {
                                        Text("\(String(format: "%.1f", bf))% BF")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                            .padding(.vertical, 2)
                        }
                        .onDelete { offsets in
                            for index in offsets {
                                modelContext.delete(entries[index])
                            }
                        }
                    }
                }
            }
            .navigationTitle("Health")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingAddEntry = true } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddEntry) {
                AddWeightEntryView()
            }
        }
    }
}
