import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { requestNotificationPermission } from './src/utils/notifications';

import DashboardScreen from './src/screens/DashboardScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import AddHabitScreen from './src/screens/AddHabitScreen';
import FinanceScreen from './src/screens/FinanceScreen';
import AddAssetScreen from './src/screens/AddAssetScreen';
import HealthScreen from './src/screens/HealthScreen';
import AddWeightScreen from './src/screens/AddWeightScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#2C2C2E',
    primary: '#6366F1',
  },
};

function HabitsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HabitsList" component={HabitsScreen} />
      <Stack.Screen name="AddHabit" component={AddHabitScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function FinanceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FinanceList" component={FinanceScreen} />
      <Stack.Screen name="AddAsset" component={AddAssetScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function HealthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthList" component={HealthScreen} />
      <Stack.Screen name="AddWeight" component={AddWeightScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <NavigationContainer theme={darkTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1C1C1E',
            borderTopColor: '#2C2C2E',
            paddingBottom: 8,
            height: 80,
          },
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#636366',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text> }}
        />
        <Tab.Screen
          name="Habits"
          component={HabitsStack}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>✅</Text> }}
        />
        <Tab.Screen
          name="Finance"
          component={FinanceStack}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💰</Text> }}
        />
        <Tab.Screen
          name="Health"
          component={HealthStack}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>❤️</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
