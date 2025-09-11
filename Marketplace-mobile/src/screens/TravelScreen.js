import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TravelItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.travelItem} onPress={onPress}>
    <Image source={{ uri: item.image }} style={styles.travelImage} />
    <View style={styles.travelInfo}>
      <Text style={styles.destination}>{item.destination}</Text>
      <Text style={styles.duration}>{item.duration}</Text>
      <View style={styles.travelMeta}>
        <Text style={styles.price}>${item.price}</Text>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function TravelScreen({ navigation }) {
  const [travels] = useState([
    { _id: '1', destination: 'Bagan Tour', duration: '3 Days 2 Nights', price: '299', rating: '4.9', image: 'https://via.placeholder.com/300x200' },
    { _id: '2', destination: 'Inle Lake', duration: '2 Days 1 Night', price: '199', rating: '4.7', image: 'https://via.placeholder.com/300x200' },
  ]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Travel & Tours</Text>
      </LinearGradient>

      <FlatList
        data={travels}
        renderItem={({ item }) => (
          <TravelItem
            item={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
          />
        )}
        keyExtractor={(item) => item._id}
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
  travelItem: { backgroundColor: 'white', borderRadius: 15, marginBottom: 15 },
  travelImage: { width: '100%', height: 150, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  travelInfo: { padding: 15 },
  destination: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  duration: { fontSize: 14, color: '#666', marginBottom: 10 },
  travelMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#ef4444' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: '#666', marginLeft: 3 },
});