import SwiftUI
import SwiftData

struct AddWeightEntryView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var date = Date()
    @State private var weightString = ""
    @State private var unit: WeightUnit = .lbs
    @State private var bodyFatString = ""
    @State private var notes = ""
    @State private var includeBodyFat = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Weight") {
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                    HStack {
                        TextField("Weight", text: $weightString)
                            .keyboardType(.decimalPad)
                        Picker("Unit", selection: $unit) {
                            ForEach(WeightUnit.allCases, id: \.self) { u in
                                Text(u.rawValue).tag(u)
                            }
                        }
                        .fixedSize()
                    }
                }

                Section("Body Composition (Optional)") {
                    Toggle("Include Body Fat %", isOn: $includeBodyFat)
                    if includeBodyFat {
                        HStack {
                            TextField("Body fat percentage", text: $bodyFatString)
                                .keyboardType(.decimalPad)
                            Text("%")
                        }
                    }
                }

                Section("Notes") {
                    TextField("Optional notes", text: $notes, axis: .vertical)
                        .lineLimit(3, reservesSpace: true)
                }
            }
            .navigationTitle("Log Weight")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveEntry()
                    }
                    .disabled(Double(weightString) == nil)
                }
            }
        }
    }

    private func saveEntry() {
        guard let weight = Double(weightString) else { return }
        let bodyFat = includeBodyFat ? Double(bodyFatString) : nil
        let entry = WeightEntry(date: date, weight: weight, unit: unit, bodyFatPercentage: bodyFat, notes: notes)
        modelContext.insert(entry)
        dismiss()
    }
}
