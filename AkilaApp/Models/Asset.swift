import SwiftData
import Foundation

enum AssetType: String, Codable, CaseIterable {
    case cash = "Cash & Bank"
    case investment = "Investments & Stocks"
    case realEstate = "Real Estate"
    case other = "Other Assets"
    case liability = "Liability"

    var icon: String {
        switch self {
        case .cash: return "banknote.fill"
        case .investment: return "chart.line.uptrend.xyaxis"
        case .realEstate: return "house.fill"
        case .other: return "cube.fill"
        case .liability: return "minus.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .cash: return "#10B981"
        case .investment: return "#6366F1"
        case .realEstate: return "#F59E0B"
        case .other: return "#8B5CF6"
        case .liability: return "#EF4444"
        }
    }
}

@Model
final class Asset {
    var id: UUID
    var name: String
    var typeRaw: String
    var value: Double
    var notes: String
    var createdAt: Date
    var updatedAt: Date

    var type: AssetType {
        get { AssetType(rawValue: typeRaw) ?? .other }
        set { typeRaw = newValue.rawValue }
    }

    init(name: String, type: AssetType, value: Double, notes: String = "") {
        self.id = UUID()
        self.name = name
        self.typeRaw = type.rawValue
        self.value = value
        self.notes = notes
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}
