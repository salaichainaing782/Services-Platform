import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { apiClient } from '../services/api';

const ProductItem = ({ product }) => (
  <TouchableOpacity style={styles.productItem}>
    <Image source={{ uri: product.image }} style={styles.productImage} />
    <View style={styles.productInfo}>
      <Text style={styles.productTitle}>{product.title}</Text>
      <Text style={styles.productPrice}>${product.price}</Text>
    </View>
  </TouchableOpacity>
);

export default function MarketplaceScreen() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.getProducts();
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => <ProductItem product={item} />}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  productsList: { padding: 15 },
  productItem: { flex: 1, backgroundColor: 'white', borderRadius: 15, margin: 5 },
  productImage: { width: '100%', height: 120, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  productInfo: { padding: 12 },
  productTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 5 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#10b981' },
});