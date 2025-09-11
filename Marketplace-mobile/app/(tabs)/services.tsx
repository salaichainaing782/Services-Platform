import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiClient } from '../../services/api';

interface Service {
  _id: string;
  title: string;
  description: string;
  serviceType: string;
  price: number;
  image: string;
  location: string;
  rating: number;
  seller: {
    username: string;
    avatar: string;
  };
  availability: string;
  likes: string[];
  comments: number;
}

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [likedServices, setLikedServices] = useState<Set<string>>(new Set());

  const serviceTypes = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'consulting', name: 'Consulting', icon: 'people' },
    { id: 'design', name: 'Design', icon: 'color-palette' },
    { id: 'development', name: 'Development', icon: 'code-slash' },
    { id: 'marketing', name: 'Marketing', icon: 'megaphone' },
    { id: 'education', name: 'Education', icon: 'school' },
    { id: 'restaurant', name: 'Restaurant', icon: 'restaurant' },
    { id: 'massage', name: 'Massage', icon: 'hand-left' },
    { id: 'gym', name: 'Gym', icon: 'fitness' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts('services');
      setServices(response.products || response || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    const colors: { [key: string]: string } = {
      daily: '#10b981',
      weekends: '#f59e0b',
      weekdays: '#3b82f6',
      appointment: '#8b5cf6',
      seasonal: '#ef4444',
    };
    return colors[availability] || '#6b7280';
  };

  const handleLike = (serviceId: string) => {
    const newLikedServices = new Set(likedServices);
    if (newLikedServices.has(serviceId)) {
      newLikedServices.delete(serviceId);
    } else {
      newLikedServices.add(serviceId);
    }
    setLikedServices(newLikedServices);
    
    // Update the service likes count in the local state
    setServices(prevServices => 
      prevServices.map(service => {
        if (service._id === serviceId) {
          const currentLikes = service.likes || [];
          const isLiked = likedServices.has(serviceId);
          return {
            ...service,
            likes: isLiked 
              ? currentLikes.filter(id => id !== 'current-user')
              : [...currentLikes, 'current-user']
          };
        }
        return service;
      })
    );
  };

  const handleViewDetails = (service: Service) => {
    router.push({
      pathname: '/service-detail',
      params: { service: JSON.stringify(service) }
    });
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity style={styles.serviceCard}>
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.availabilityBadge,
              { backgroundColor: getAvailabilityColor(item.availability) },
            ]}
          >
            <Text style={styles.availabilityText}>{item.availability}</Text>
          </View>
        </View>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="location" size={14} color="#6b7280" />
            <Text style={styles.serviceDetailText}>{item.location}</Text>
          </View>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.serviceDetailText}>{item.rating}</Text>
          </View>
        </View>
        
        <View style={styles.serviceActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item._id)}
          >
            <Ionicons 
              name={likedServices.has(item._id) ? "heart" : "heart-outline"} 
              size={18} 
              color={likedServices.has(item._id) ? "#ef4444" : "#6b7280"} 
            />
            <Text style={styles.actionText}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
            <Text style={styles.actionText}>{item.comments || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.viewDetailButton}
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.viewDetailText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.serviceFooter}>
          <View style={styles.providerInfo}>
            <Image
              source={{ uri: item.seller.avatar || 'https://via.placeholder.com/30' }}
              style={styles.providerAvatar}
            />
            <Text style={styles.providerName}>{item.seller.username}</Text>
          </View>
          <Text style={styles.servicePrice}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredServices =
    selectedType === 'all'
      ? services
      : services.filter((service) => service.serviceType === selectedType);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
        <Text style={styles.headerSubtitle}>Find professional services near you</Text>
      </View>

      <View style={styles.typesWrapper}>
        <FlatList
          data={serviceTypes}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === item.id && styles.typeButtonActive,
              ]}
              onPress={() => setSelectedType(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={selectedType === item.id ? '#fff' : '#6b7280'}
              />
              <Text
                style={[
                  styles.typeText,
                  selectedType === item.id && styles.typeTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typesContent}
        />
      </View>

      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.servicesList}
        refreshing={loading}
        onRefresh={fetchServices}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No services found.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 5 },
  typesWrapper: { backgroundColor: '#fff', paddingVertical: 12 },
  typesContent: { paddingHorizontal: 20 },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  typeButtonActive: { backgroundColor: '#3b82f6' },
  typeText: { marginLeft: 5, fontSize: 14, color: '#6b7280' },
  typeTextActive: { color: '#fff' },
  servicesList: { padding: 20 },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  serviceImage: { width: '100%', height: 150 },
  serviceContent: { padding: 16 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1, marginRight: 10 },
  availabilityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  availabilityText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  serviceDescription: { fontSize: 14, color: '#6b7280', lineHeight: 18, marginBottom: 12 },
  serviceDetails: { flexDirection: 'row', marginBottom: 12 },
  serviceDetailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  serviceDetailText: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
  serviceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  providerInfo: { flexDirection: 'row', alignItems: 'center' },
  providerAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  providerName: { fontSize: 14, color: '#6b7280' },
  servicePrice: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
  serviceActions: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionText: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
  viewDetailButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  viewDetailText: { fontSize: 12, color: '#3b82f6', fontWeight: '600', marginRight: 4 },
  emptyBox: { marginTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#6b7280' },
});
