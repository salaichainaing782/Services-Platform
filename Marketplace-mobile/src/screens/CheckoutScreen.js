import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../contexts/CartContext';

export default function CheckoutScreen({ navigation }) {
  const { items, getCartTotal } = useCart();
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePlaceOrder = () => {
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      Alert.alert('Error', 'Please fill in all shipping information');
      return;
    }
    Alert.alert('Success', 'Order placed successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('OrderHistory') }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={shippingInfo.address}
            onChangeText={(text) => setShippingInfo({...shippingInfo, address: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={shippingInfo.city}
            onChangeText={(text) => setShippingInfo({...shippingInfo, city: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={shippingInfo.phone}
            onChangeText={(text) => setShippingInfo({...shippingInfo, phone: text})}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.selectedPayment]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons name="card-outline" size={24} color={paymentMethod === 'card' ? '#3b82f6' : '#666'} />
            <Text style={[styles.paymentText, paymentMethod === 'card' && styles.selectedPaymentText]}>
              Credit/Debit Card
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.selectedPayment]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cash' ? '#3b82f6' : '#666'} />
            <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.selectedPaymentText]}>
              Cash on Delivery
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${getCartTotal().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text style={styles.summaryValue}>$5.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${(getCartTotal() + 5).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.gradient}>
            <Text style={styles.placeOrderText}>Place Order</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: 'white' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  content: { flex: 1 },
  section: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 10, marginBottom: 10, fontSize: 16 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 10, backgroundColor: '#f8fafc' },
  selectedPayment: { backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#3b82f6' },
  paymentText: { fontSize: 16, color: '#666', marginLeft: 15 },
  selectedPaymentText: { color: '#3b82f6', fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 16, color: '#1f2937' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 10 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  bottomSection: { backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  placeOrderButton: { borderRadius: 25, overflow: 'hidden' },
  gradient: { paddingVertical: 15, alignItems: 'center' },
  placeOrderText: { color: 'white', fontSize: 18, fontWeight: '600' },
});