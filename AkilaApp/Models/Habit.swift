import SwiftData
import Foundation

@Model
final class Habit {
    var id: UUID
    var name: String
    var emoji: String
    var colorHex: String
    var frequency: String // "daily" or "weekly"
    var targetWeekdays: [Int] // 0=Sun...6=Sat, empty means every day
    var completionDates: [Date]
    var reminderEnabled: Bool
    var reminderHour: Int
    var reminderMinute: Int
    var createdAt: Date

    init(name: String, emoji: String = "⭐", colorHex: String = "#6366F1", frequency: String = "daily", targetWeekdays: [Int] = [], reminderEnabled: Bool = false, reminderHour: Int = 8, reminderMinute: Int = 0) {
        self.id = UUID()
        self.name = name
        self.emoji = emoji
        self.colorHex = colorHex
        self.frequency = frequency
        self.targetWeekdays = targetWeekdays
        self.completionDates = []
        self.reminderEnabled = reminderEnabled
        self.reminderHour = reminderHour
        self.reminderMinute = reminderMinute
        self.createdAt = Date()
    }

    var isCompletedToday: Bool {
        let today = Calendar.current.startOfDay(for: Date())
        return completionDates.contains { Calendar.current.isDate($0, inSameDayAs: today) }
    }

    var currentStreak: Int {
        guard !completionDates.isEmpty else { return 0 }
        let calendar = Calendar.current
        let sortedDates = completionDates.map { calendar.startOfDay(for: $0) }.sorted(by: >)
        let today = calendar.startOfDay(for: Date())
        var streak = 0
        var checkDate = isCompletedToday ? today : calendar.date(byAdding: .day, value: -1, to: today)!

        for date in sortedDates {
            if calendar.isDate(date, inSameDayAs: checkDate) {
                streak += 1
                checkDate = calendar.date(byAdding: .day, value: -1, to: checkDate)!
            } else if date < checkDate {
                break
            }
        }
        return streak
    }

    func toggleToday() {
        let today = Calendar.current.startOfDay(for: Date())
        if isCompletedToday {
            completionDates.removeAll { Calendar.current.isDate($0, inSameDayAs: today) }
        } else {
            completionDates.append(Date())
        }
    }
}
