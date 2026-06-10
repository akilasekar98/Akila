import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface DataPoint {
  value: number;
  label?: string;
}

interface Props {
  data: DataPoint[];
  color?: string;
  height?: number;
  width: number;
}

export default function LineChart({ data, color = '#6366F1', height = 160, width }: Props) {
  if (data.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Not enough data</Text>
      </View>
    );
  }

  const padding = { top: 12, bottom: 24, left: 8, right: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value - minVal) / range) * chartH,
  }));

  const pathD = points
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ');

  const areaD = `${pathD} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  return (
    <Svg width={width} height={height}>
      <Path d={areaD} fill={color} fillOpacity={0.15} />
      <Path d={pathD} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {[minVal, maxVal].map((v, i) => (
        <Text
          key={i}
          style={[styles.label, {
            position: 'absolute',
            left: 0,
            top: i === 0 ? height - padding.bottom - 4 : padding.top - 12,
          }]}
        >
          {v.toFixed(1)}
        </Text>
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#636366',
    fontSize: 13,
  },
  label: {
    fontSize: 10,
    color: '#636366',
  },
});
