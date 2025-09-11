import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CategoryCard = ({ title, icon, color, onPress }) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
    <LinearGradient colors={color} style={styles.categoryGradient}>
      <Ionicons name={icon} size={32} color="white" />
      <Text style={styles.categoryText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const categories = [
    { title: 'Marketplace', icon: 'storefront', color: ['#3b82f6', '#1d4ed8'] },
    { title: 'Secondhand', icon: 'refresh', color: ['#10b981', '#059669'] },
    { title: 'Jobs', icon: 'briefcase', color: ['#8b5cf6', '#7c3aed'] },
    { title: 'Services', icon: 'construct', color: ['#f59e0b', '#d97706'] },
    { title: 'Travel', icon: 'airplane', color: ['#ef4444', '#dc2626'] },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.header}>
        <Text style={styles.headerTitle}>MarketHub</Text>
        <Text style={styles.headerSubtitle}>Your all-in-one marketplace</Text>
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
              onPress={() => navigation.navigate(category.title)}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  categoriesScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  categoryCard: { marginRight: 15, borderRadius: 15, overflow: 'hidden' },
  categoryGradient: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  categoryText: { color: 'white', fontSize: 12, fontWeight: '600', marginTop: 5 },
});