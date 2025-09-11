import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const JobItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.jobItem} onPress={onPress}>
    <View style={styles.jobHeader}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.salary}>${item.salary}</Text>
    </View>
    <Text style={styles.company}>{item.company}</Text>
    <View style={styles.jobMeta}>
      <View style={styles.metaItem}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.metaText}>{item.location}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="time-outline" size={14} color="#666" />
        <Text style={styles.metaText}>{item.type}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function JobsScreen({ navigation }) {
  const [jobs] = useState([
    { _id: '1', title: 'Software Developer', company: 'Tech Corp', salary: '5000', location: 'Remote', type: 'Full-time' },
    { _id: '2', title: 'Designer', company: 'Creative Studio', salary: '4000', location: 'Yangon', type: 'Part-time' },
  ]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Opportunities</Text>
      </LinearGradient>

      <FlatList
        data={jobs}
        renderItem={({ item }) => (
          <JobItem
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
  jobItem: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  salary: { fontSize: 16, fontWeight: 'bold', color: '#8b5cf6' },
  company: { fontSize: 14, color: '#666', marginBottom: 10 },
  jobMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#666', marginLeft: 3 },
});