import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SecondhandItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Image source={{ uri: item.image }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <View style={styles.condition}>
        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
        <Text style={styles.conditionText}>{item.condition || 'Good'}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function SecondhandScreen({ navigation }) {
  const [items, setItems] = useState([]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#10b981', '#059669']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secondhand Items</Text>
      </LinearGradient>

      <FlatList
        data={items}
        renderItem={({ item }) => (
          <SecondhandItem
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
  item: { flex: 1, backgroundColor: 'white', borderRadius: 15, margin: 5 },
  image: { width: '100%', height: 120, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  info: { padding: 12 },
  title: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 5 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#10b981', marginBottom: 5 },
  condition: { flexDirection: 'row', alignItems: 'center' },
  conditionText: { fontSize: 12, color: '#10b981', marginLeft: 3 },
});