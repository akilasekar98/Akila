import SwiftUI
import SwiftData

struct AddAssetView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    var asset: Asset?

    @State private var name = ""
    @State private var type: AssetType = .cash
    @State private var valueString = ""
    @State private var notes = ""

    var isEditing: Bool { asset != nil }

    var body: some View {
        NavigationStack {
            Form {
                Section("Asset Details") {
                    TextField("Name (e.g. Chase Checking)", text: $name)
                    Picker("Type", selection: $type) {
                        ForEach(AssetType.allCases, id: \.self) { t in
                            HStack {
                                Image(systemName: t.icon)
                                Text(t.rawValue)
                            }.tag(t)
                        }
                    }
                    HStack {
                        Text("$")
                        TextField("Value", text: $valueString)
                            .keyboardType(.decimalPad)
                    }
                }
                Section("Notes") {
                    TextField("Optional notes", text: $notes, axis: .vertical)
                        .lineLimit(3, reservesSpace: true)
                }
            }
            .navigationTitle(isEditing ? "Edit Asset" : "New Asset")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(isEditing ? "Save" : "Add") {
                        saveAsset()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || Double(valueString) == nil)
                }
            }
            .onAppear {
                if let asset {
                    name = asset.name
                    type = asset.type
                    valueString = String(asset.value)
                    notes = asset.notes
                }
            }
        }
    }

    private func saveAsset() {
        guard let value = Double(valueString) else { return }
        if let asset {
            asset.name = name.trimmingCharacters(in: .whitespaces)
            asset.type = type
            asset.value = value
            asset.notes = notes
            asset.updatedAt = Date()
        } else {
            let newAsset = Asset(name: name.trimmingCharacters(in: .whitespaces), type: type, value: value, notes: notes)
            modelContext.insert(newAsset)
        }
        dismiss()
    }
}
