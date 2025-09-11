import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCart } from '../contexts/CartContext';

export default function CartScreen() {
  const { items, getCartTotal } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.itemCount}>{items.length} items</Text>
        <Text style={styles.total}>Total: ${getCartTotal().toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemCount: { fontSize: 18, color: '#666', marginBottom: 10 },
  total: { fontSize: 24, fontWeight: 'bold', color: '#10b981' },
});