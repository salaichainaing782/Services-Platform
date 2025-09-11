import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrderItem = ({ item }) => (
  <View style={styles.orderItem}>
    <View style={styles.orderHeader}>
      <Text style={styles.orderId}>Order #{item.id}</Text>
      <Text style={[styles.status, { color: item.status === 'Delivered' ? '#10b981' : '#f59e0b' }]}>
        {item.status}
      </Text>
    </View>
    <Text style={styles.orderDate}>{item.date}</Text>
    <Text style={styles.orderTotal}>${item.total}</Text>
    <Text style={styles.itemCount}>{item.items} items</Text>
  </View>
);

export default function OrderHistoryScreen({ navigation }) {
  const [orders] = useState([
    { id: '12345', date: '2024-01-15', total: '299.99', items: 3, status: 'Delivered' },
    { id: '12346', date: '2024-01-10', total: '149.50', items: 2, status: 'Processing' },
    { id: '12347', date: '2024-01-05', total: '89.99', items: 1, status: 'Delivered' },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={({ item }) => <OrderItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: 'white' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  list: { padding: 20 },
  orderItem: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  status: { fontSize: 14, fontWeight: '600' },
  orderDate: { fontSize: 14, color: '#666', marginBottom: 5 },
  orderTotal: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6', marginBottom: 3 },
  itemCount: { fontSize: 14, color: '#666' },
});