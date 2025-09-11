import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PostAdScreen({ navigation }) {
  const [adData, setAdData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'marketplace',
    location: ''
  });

  const categories = [
    { value: 'marketplace', label: 'Marketplace', color: '#3b82f6' },
    { value: 'secondhand', label: 'Secondhand', color: '#10b981' },
    { value: 'jobs', label: 'Jobs', color: '#8b5cf6' },
    { value: 'services', label: 'Services', color: '#f59e0b' },
    { value: 'travel', label: 'Travel', color: '#ef4444' },
  ];

  const handlePostAd = () => {
    if (!adData.title || !adData.description || !adData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    Alert.alert('Success', 'Your ad has been posted successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post an Ad</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter ad title"
            value={adData.title}
            onChangeText={(text) => setAdData({...adData, title: text})}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryOption,
                  { backgroundColor: adData.category === category.value ? category.color : '#f8fafc' }
                ]}
                onPress={() => setAdData({...adData, category: category.value})}
              >
                <Text style={[
                  styles.categoryText,
                  { color: adData.category === category.value ? 'white' : '#666' }
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your item or service"
            value={adData.description}
            onChangeText={(text) => setAdData({...adData, description: text})}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            value={adData.price}
            onChangeText={(text) => setAdData({...adData, price: text})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={adData.location}
            onChangeText={(text) => setAdData({...adData, location: text})}
          />
        </View>

        <TouchableOpacity style={styles.imageButton}>
          <Ionicons name="camera-outline" size={24} color="#3b82f6" />
          <Text style={styles.imageButtonText}>Add Photos</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.postButton} onPress={handlePostAd}>
          <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.gradient}>
            <Text style={styles.postButtonText}>Post Ad</Text>
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
  label: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 10 },
  input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 10, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryOption: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
  categoryText: { fontSize: 14, fontWeight: '600' },
  imageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 15, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed' },
  imageButtonText: { fontSize: 16, color: '#3b82f6', marginLeft: 10, fontWeight: '600' },
  bottomSection: { backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  postButton: { borderRadius: 25, overflow: 'hidden' },
  gradient: { paddingVertical: 15, alignItems: 'center' },
  postButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});