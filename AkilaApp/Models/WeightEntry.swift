import SwiftData
import Foundation

enum WeightUnit: String, Codable, CaseIterable {
    case lbs = "lbs"
    case kg = "kg"
}

@Model
final class WeightEntry {
    var id: UUID
    var date: Date
    var weight: Double
    var unitRaw: String
    var bodyFatPercentage: Double?
    var notes: String

    var unit: WeightUnit {
        get { WeightUnit(rawValue: unitRaw) ?? .lbs }
        set { unitRaw = newValue.rawValue }
    }

    init(date: Date = Date(), weight: Double, unit: WeightUnit = .lbs, bodyFatPercentage: Double? = nil, notes: String = "") {
        self.id = UUID()
        self.date = date
        self.weight = weight
        self.unitRaw = unit.rawValue
        self.bodyFatPercentage = bodyFatPercentage
        self.notes = notes
    }
}
