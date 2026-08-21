import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HeartsDisplay({ hearts, heartsStart }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: heartsStart }).map((_, i) => (
        <Text key={i} style={styles.icon}>
          {i < hearts ? '❤️' : '🤍'}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  icon: { fontSize: 18 },
});