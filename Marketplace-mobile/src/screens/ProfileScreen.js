import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <View style={styles.content}>
        {isAuthenticated ? (
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={80} color="#3b82f6" />
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        ) : (
          <View style={styles.guestInfo}>
            <Ionicons name="person-outline" size={80} color="#666" />
            <Text style={styles.guestText}>Please login to view profile</Text>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userInfo: { alignItems: 'center' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 15 },
  userEmail: { fontSize: 16, color: '#666', marginTop: 5 },
  guestInfo: { alignItems: 'center' },
  guestText: { fontSize: 18, color: '#666', marginTop: 15, marginBottom: 20 },
  loginButton: { backgroundColor: '#3b82f6', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});