import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Habit } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleHabitReminder(habit: Habit): Promise<void> {
  if (!habit.reminderEnabled) return;
  await cancelHabitReminder(habit.id);
  await Notifications.scheduleNotificationAsync({
    identifier: habit.id,
    content: {
      title: 'Habit Reminder',
      body: `${habit.emoji} ${habit.name}`,
      sound: true,
    },
    trigger: {
      hour: habit.reminderHour,
      minute: habit.reminderMinute,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(habitId).catch(() => {});
}
