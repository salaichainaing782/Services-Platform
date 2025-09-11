import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../services/api';

interface Job {
  _id: string;
  title: string;
  description: string;
  jobType: string;
  experience: string;
  salary: number;
  location: string;
  seller: {
    username: string;
  };
  createdAt: string;
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  const jobTypes = [
    { id: 'all', name: 'All Jobs' },
    { id: 'full-time', name: 'Full Time' },
    { id: 'part-time', name: 'Part Time' },
    { id: 'contract', name: 'Contract' },
    { id: 'remote', name: 'Remote' },
    { id: 'internship', name: 'Internship' },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts('jobs');
      setJobs(response.products || response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const getJobTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'full-time': '#10b981',
      'part-time': '#f59e0b',
      'contract': '#8b5cf6',
      'remote': '#3b82f6',
      'internship': '#ef4444',
    };
    return colors[type] || '#6b7280';
  };

  const renderJob = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <View
          style={[
            styles.jobTypeBadge,
            { backgroundColor: getJobTypeColor(item.jobType) },
          ]}
        >
          <Text style={styles.jobTypeText}>{item.jobType}</Text>
        </View>
      </View>

      <Text style={styles.jobDescription} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.jobDetails}>
        <View style={styles.jobDetailItem}>
          <Ionicons name="location" size={16} color="#6b7280" />
          <Text style={styles.jobDetailText}>{item.location}</Text>
        </View>

        <View style={styles.jobDetailItem}>
          <Ionicons name="briefcase" size={16} color="#6b7280" />
          <Text style={styles.jobDetailText}>{item.experience}</Text>
        </View>

        {item.salary && (
          <View style={styles.jobDetailItem}>
            <Ionicons name="cash" size={16} color="#6b7280" />
            <Text style={styles.jobDetailText}>${item.salary}/month</Text>
          </View>
        )}
      </View>

      <View style={styles.jobFooter}>
        <Text style={styles.companyName}>by {item.seller.username}</Text>
        <Text style={styles.jobDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filteredJobs =
    selectedType === 'all'
      ? jobs
      : jobs.filter((job) => job.jobType === selectedType);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Opportunities</Text>
        <Text style={styles.headerSubtitle}>
          {filteredJobs.length} jobs available
        </Text>
      </View>

      {/* Filters (fixed at top, independent from job list) */}
      <View style={styles.filtersWrapper}>
        <FlatList
          data={jobTypes}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedType === item.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedType === item.id && styles.filterTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Jobs list */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJob}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.jobsList}
        refreshing={loading}
        onRefresh={fetchJobs}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No jobs found.</Text>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  filtersWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  jobsList: {
    padding: 20,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  jobTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobTypeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 15,
  },
  jobDetails: {
    marginBottom: 15,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  jobDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  jobDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },
});
