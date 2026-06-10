import SwiftUI
import SwiftData
import Charts

struct FinanceView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Asset.createdAt) private var assets: [Asset]
    @State private var showingAddAsset = false
    @State private var selectedAsset: Asset?

    private var netWorth: Double {
        assets.reduce(0.0) { sum, asset in
            asset.type == .liability ? sum - asset.value : sum + asset.value
        }
    }

    private var groupedAssets: [(AssetType, [Asset])] {
        AssetType.allCases.compactMap { type in
            let filtered = assets.filter { $0.type == type }
            return filtered.isEmpty ? nil : (type, filtered)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(spacing: 8) {
                        Text("Net Worth")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text(formatCurrency(netWorth))
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundStyle(netWorth >= 0 ? .green : .red)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }

                if assets.isEmpty {
                    Section {
                        ContentUnavailableView(
                            "No Assets Yet",
                            systemImage: "dollarsign.circle",
                            description: Text("Tap + to track your first asset")
                        )
                    }
                }

                ForEach(groupedAssets, id: \.0) { type, typeAssets in
                    Section(header: HStack {
                        Image(systemName: type.icon)
                        Text(type.rawValue)
                    }) {
                        ForEach(typeAssets) { asset in
                            Button {
                                selectedAsset = asset
                            } label: {
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(asset.name)
                                            .fontWeight(.medium)
                                            .foregroundStyle(.primary)
                                        if !asset.notes.isEmpty {
                                            Text(asset.notes)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                    }
                                    Spacer()
                                    Text(formatCurrency(asset.value))
                                        .fontWeight(.semibold)
                                        .foregroundStyle(type == .liability ? .red : .primary)
                                }
                            }
                        }
                        .onDelete { offsets in
                            for index in offsets {
                                modelContext.delete(typeAssets[index])
                            }
                        }
                        Text("Subtotal: \(formatCurrency(typeAssets.reduce(0) { $0 + $1.value }))")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Finance")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingAddAsset = true } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddAsset) {
                AddAssetView()
            }
            .sheet(item: $selectedAsset) { asset in
                AddAssetView(asset: asset)
            }
        }
    }

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: value)) ?? "$0"
    }
}
