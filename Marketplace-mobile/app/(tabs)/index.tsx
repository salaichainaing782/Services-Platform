import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiClient } from '../../services/api';

const CategoryCard = ({ title, icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
    <LinearGradient colors={color} style={styles.categoryGradient}>
      <Ionicons name={icon} size={32} color="white" />
      <Text style={styles.categoryText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stats, setStats] = useState({ products: 0, jobs: 0, services: 0 });

  const categories = [
    { title: 'Marketplace', icon: 'storefront', color: ['#3b82f6', '#1d4ed8'], route: 'marketplace' },
    { title: 'Jobs', icon: 'briefcase', color: ['#8b5cf6', '#7c3aed'], route: 'jobs' },
    { title: 'Services', icon: 'construct', color: ['#f59e0b', '#d97706'], route: 'services' },
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await apiClient.getProducts();
      setFeaturedProducts(response.products || response || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.header}>
        <Text style={styles.headerTitle}>MarketHub</Text>
        <Text style={styles.headerSubtitle}>Your all-in-one marketplace</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.2K+</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>350+</Text>
            <Text style={styles.statLabel}>Jobs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              icon={category.icon}
              color={category.color}
              onPress={() => router.push(`/(tabs)/${category.route}`)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search" size={24} color="#3b82f6" />
            <Text style={styles.actionText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart" size={24} color="#ef4444" />
            <Text style={styles.actionText}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={24} color="#10b981" />
            <Text style={styles.actionText}>Post Ad</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  statLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  categoriesScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  categoryCard: { marginRight: 15, borderRadius: 15, overflow: 'hidden' },
  categoryGradient: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  categoryText: { color: 'white', fontSize: 12, fontWeight: '600', marginTop: 5 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  actionText: { marginTop: 8, fontSize: 14, color: '#1f2937', fontWeight: '600' },
});
