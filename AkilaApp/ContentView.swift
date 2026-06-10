import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "house.fill")
                }
            HabitsView()
                .tabItem {
                    Label("Habits", systemImage: "checkmark.circle.fill")
                }
            FinanceView()
                .tabItem {
                    Label("Finance", systemImage: "dollarsign.circle.fill")
                }
            HealthView()
                .tabItem {
                    Label("Health", systemImage: "heart.fill")
                }
        }
        .accentColor(.indigo)
    }
}
