import SwiftUI
import SwiftData

@main
struct AkilaAppApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Habit.self, Asset.self, WeightEntry.self])
    }
}
