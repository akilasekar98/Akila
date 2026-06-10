import SwiftUI
import SwiftData

struct DashboardView: View {
    @Query private var habits: [Habit]
    @Query private var assets: [Asset]
    @Query(sort: \WeightEntry.date, order: .reverse) private var weightEntries: [WeightEntry]

    private var completedToday: Int { habits.filter { $0.isCompletedToday }.count }
    private var totalHabits: Int { habits.count }

    private var netWorth: Double {
        assets.reduce(0.0) { sum, asset in
            asset.type == .liability ? sum - asset.value : sum + asset.value
        }
    }

    private var latestWeight: WeightEntry? { weightEntries.first }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Good \(timeOfDayGreeting)")
                            .font(.title2)
                            .foregroundStyle(.secondary)
                        Text("Here's your overview")
                            .font(.title)
                            .fontWeight(.bold)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        SummaryCard(
                            title: "Habits Today",
                            value: "\(completedToday)/\(totalHabits)",
                            subtitle: totalHabits == 0 ? "No habits yet" : completedToday == totalHabits ? "All done!" : "\(totalHabits - completedToday) remaining",
                            icon: "checkmark.circle.fill",
                            color: .indigo
                        )

                        SummaryCard(
                            title: "Net Worth",
                            value: formatCurrency(netWorth),
                            subtitle: "\(assets.count) assets tracked",
                            icon: "dollarsign.circle.fill",
                            color: netWorth >= 0 ? .green : .red
                        )

                        SummaryCard(
                            title: "Weight",
                            value: latestWeight.map { "\(String(format: "%.1f", $0.weight)) \($0.unit.rawValue)" } ?? "—",
                            subtitle: latestWeight.map { "Logged \(relativeDate($0.date))" } ?? "No entries yet",
                            icon: "heart.fill",
                            color: .pink
                        )

                        SummaryCard(
                            title: "Best Streak",
                            value: habits.map { $0.currentStreak }.max().map { "\($0) days" } ?? "—",
                            subtitle: habits.max(by: { $0.currentStreak < $1.currentStreak }).map { $0.name } ?? "No habits yet",
                            icon: "flame.fill",
                            color: .orange
                        )
                    }
                    .padding(.horizontal)

                    if !habits.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Today's Habits")
                                .font(.headline)
                                .padding(.horizontal)
                            ForEach(habits.prefix(5)) { habit in
                                HStack {
                                    Text(habit.emoji)
                                        .font(.title3)
                                    Text(habit.name)
                                        .fontWeight(.medium)
                                    Spacer()
                                    if habit.isCompletedToday {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundStyle(.green)
                                    } else {
                                        Image(systemName: "circle")
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .padding(.horizontal)
                                .padding(.vertical, 6)
                            }
                        }
                        .padding(.vertical, 12)
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var timeOfDayGreeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "morning"
        case 12..<17: return "afternoon"
        default: return "evening"
        }
    }

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: value)) ?? "$0"
    }

    private func relativeDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

struct SummaryCard: View {
    let title: String
    let value: String
    let subtitle: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundStyle(color)
                Spacer()
            }
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(title)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
            Text(subtitle)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}
