import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}

export default function SummaryCard({ title, value, subtitle, icon, color }: Props) {
  return (
    <View style={styles.card}>
      <Text style={[styles.icon, { color }]}>{icon}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  subtitle: {
    fontSize: 11,
    color: '#636366',
  },
});
