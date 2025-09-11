import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../../services/api';

interface Product {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  location: string;
  rating: number;
}

interface Category {
  id: 'all' | 'marketplace' | 'secondhand';
  name: string;
  icon: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;

export default function MarketplaceScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: Category[] = [
    { id: 'all', name: 'All Products', icon: 'grid' },
    { id: 'marketplace', name: 'New', icon: 'storefront' },
    { id: 'secondhand', name: 'Secondhand', icon: 'refresh' },
  ];

  const categoriesRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (selectedCategory === 'all') {
        const [marketplaceRes, secondhandRes] = await Promise.all([
          apiClient.getProducts('marketplace'),
          apiClient.getProducts('secondhand'),
        ]);
        const marketplaceProducts = marketplaceRes.products || marketplaceRes || [];
        const secondhandProducts = secondhandRes.products || secondhandRes || [];
        setProducts([...marketplaceProducts, ...secondhandProducts]);
      } else {
        const response = await apiClient.getProducts(selectedCategory);
        setProducts(response.products || response || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          q === '' || (p.title ?? '').toLowerCase().includes(q);
        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory;
        return matchesQuery && matchesCategory;
      }),
    [products, searchQuery, selectedCategory]
  );

  const renderCategory = useCallback(
    ({ item }: { item: Category }) => {
      const active = selectedCategory === item.id;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedCategory(item.id)}
          style={styles.categoryWrapper}
        >
          {active ? (
            <LinearGradient
              colors={['#6366f1', '#3b82f6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.categoryPill, styles.categoryPillActive]}
            >
              <Ionicons name={item.icon as any} size={18} color="#fff" />
              <Text
                style={[styles.categoryText, styles.categoryTextActive]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </LinearGradient>
          ) : (
            <View style={styles.categoryPill}>
              <Ionicons name={item.icon as any} size={18} color="#374151" />
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedCategory]
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity style={styles.productCard} activeOpacity={0.9}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderBox}>
            <Ionicons name="image-outline" size={40} color="#9ca3af" />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>
            ${Number(item.price).toLocaleString()}
          </Text>
          <View style={styles.productMeta}>
            <Text style={styles.productLocation} numberOfLines={1}>
              {item.location}
            </Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.ratingText}>
                {item.rating?.toFixed(1) ?? 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#6366f1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={18}
            color="#9ca3af"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Categories bar (fixed) */}
      <View style={{ paddingVertical: 12 }}>
        <FlatList
          ref={categoriesRef}
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      {/* Products */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.columnWrapper}
        refreshing={loading}
        onRefresh={fetchProducts}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryWrapper: {
    marginRight: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryPillActive: {
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsList: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (SCREEN_WIDTH - CARD_MARGIN * 3) / 2,
    marginBottom: CARD_MARGIN * 1.5,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f3f4f6',
  },
  placeholderBox: {
    width: '100%',
    height: 140,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '700',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productLocation: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#a16207',
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
  },
});
