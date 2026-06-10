import SwiftUI
import SwiftData

struct HabitsView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Habit.createdAt) private var habits: [Habit]
    @State private var showingAddHabit = false

    var body: some View {
        NavigationStack {
            Group {
                if habits.isEmpty {
                    ContentUnavailableView(
                        "No Habits Yet",
                        systemImage: "checkmark.circle",
                        description: Text("Tap + to add your first habit")
                    )
                } else {
                    List {
                        Section {
                            let completedCount = habits.filter { $0.isCompletedToday }.count
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("Today's Progress")
                                        .font(.headline)
                                    Text("\(completedCount) of \(habits.count) completed")
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                CircularProgressView(progress: habits.isEmpty ? 0 : Double(completedCount) / Double(habits.count))
                                    .frame(width: 48, height: 48)
                            }
                            .padding(.vertical, 4)
                        }

                        Section("Habits") {
                            ForEach(habits) { habit in
                                HabitRowView(habit: habit)
                            }
                            .onDelete(perform: deleteHabits)
                        }
                    }
                }
            }
            .navigationTitle("Habits")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingAddHabit = true } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddHabit) {
                AddHabitView()
            }
        }
    }

    private func deleteHabits(offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(habits[index])
        }
    }
}

struct HabitRowView: View {
    @Bindable var habit: Habit

    var body: some View {
        HStack(spacing: 14) {
            Button {
                habit.toggleToday()
            } label: {
                Image(systemName: habit.isCompletedToday ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(habit.isCompletedToday ? .green : .secondary)
                    .animation(.spring(duration: 0.3), value: habit.isCompletedToday)
            }
            .buttonStyle(.plain)

            Text(habit.emoji)
                .font(.title3)

            VStack(alignment: .leading, spacing: 2) {
                Text(habit.name)
                    .fontWeight(.medium)
                    .strikethrough(habit.isCompletedToday)
                    .foregroundStyle(habit.isCompletedToday ? .secondary : .primary)

                if habit.currentStreak > 0 {
                    HStack(spacing: 3) {
                        Image(systemName: "flame.fill")
                            .foregroundStyle(.orange)
                            .font(.caption)
                        Text("\(habit.currentStreak) day streak")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

struct CircularProgressView: View {
    let progress: Double

    var body: some View {
        ZStack {
            Circle()
                .stroke(.secondary.opacity(0.2), lineWidth: 5)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(.indigo, style: StrokeStyle(lineWidth: 5, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut, value: progress)
            Text("\(Int(progress * 100))%")
                .font(.caption2)
                .fontWeight(.semibold)
        }
    }
}
