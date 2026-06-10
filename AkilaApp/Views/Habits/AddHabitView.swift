import SwiftUI
import SwiftData

struct AddHabitView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var emoji = "⭐"
    @State private var reminderEnabled = false
    @State private var reminderTime = Date()
    @State private var showingEmojiPicker = false

    private let emojiOptions = ["⭐", "💪", "🏃", "📚", "🧘", "💧", "🥗", "😴", "🎯", "✍️", "🎸", "🧹", "💊", "🌿", "🙏"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Habit Details") {
                    HStack {
                        Button {
                            showingEmojiPicker.toggle()
                        } label: {
                            Text(emoji)
                                .font(.largeTitle)
                                .padding(8)
                                .background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                        }
                        .buttonStyle(.plain)

                        TextField("Habit name", text: $name)
                            .font(.headline)
                    }

                    if showingEmojiPicker {
                        LazyVGrid(columns: Array(repeating: .init(.flexible()), count: 5), spacing: 12) {
                            ForEach(emojiOptions, id: \.self) { e in
                                Button {
                                    emoji = e
                                    showingEmojiPicker = false
                                } label: {
                                    Text(e)
                                        .font(.title2)
                                        .padding(6)
                                        .background(emoji == e ? .indigo.opacity(0.2) : .clear, in: RoundedRectangle(cornerRadius: 8))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }

                Section("Reminder") {
                    Toggle("Daily Reminder", isOn: $reminderEnabled)
                    if reminderEnabled {
                        DatePicker("Time", selection: $reminderTime, displayedComponents: .hourAndMinute)
                    }
                }
            }
            .navigationTitle("New Habit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        addHabit()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }

    private func addHabit() {
        let components = Calendar.current.dateComponents([.hour, .minute], from: reminderTime)
        let habit = Habit(
            name: name.trimmingCharacters(in: .whitespaces),
            emoji: emoji,
            reminderEnabled: reminderEnabled,
            reminderHour: components.hour ?? 8,
            reminderMinute: components.minute ?? 0
        )
        modelContext.insert(habit)

        if reminderEnabled {
            NotificationService.shared.scheduleReminder(for: habit)
        }

        dismiss()
    }
}
