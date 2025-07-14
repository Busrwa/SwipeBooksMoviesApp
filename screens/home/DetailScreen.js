import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Detay Sayfası</Text>
      {/* Seçilen kartın detayları burada gösterilecek */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24 },
});
