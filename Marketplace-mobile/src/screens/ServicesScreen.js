import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ServiceItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.serviceItem} onPress={onPress}>
    <Image source={{ uri: item.image }} style={styles.serviceImage} />
    <View style={styles.serviceInfo}>
      <Text style={styles.serviceTitle}>{item.title}</Text>
      <Text style={styles.serviceProvider}>{item.provider}</Text>
      <View style={styles.serviceMeta}>
        <Text style={styles.servicePrice}>${item.price}/hr</Text>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ServicesScreen({ navigation }) {
  const [services] = useState([
    { _id: '1', title: 'Home Cleaning', provider: 'Clean Pro', price: '25', rating: '4.8', image: 'https://via.placeholder.com/150' },
    { _id: '2', title: 'Plumbing', provider: 'Fix It', price: '40', rating: '4.9', image: 'https://via.placeholder.com/150' },
  ]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services</Text>
      </LinearGradient>

      <FlatList
        data={services}
        renderItem={({ item }) => (
          <ServiceItem
            item={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
          />
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  list: { padding: 15 },
  serviceItem: { flex: 1, backgroundColor: 'white', borderRadius: 15, margin: 5 },
  serviceImage: { width: '100%', height: 100, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  serviceInfo: { padding: 12 },
  serviceTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 3 },
  serviceProvider: { fontSize: 12, color: '#666', marginBottom: 8 },
  serviceMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  servicePrice: { fontSize: 14, fontWeight: 'bold', color: '#f59e0b' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#666', marginLeft: 2 },
});