import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';

export default function ViewRecordScreen() {
  const route = useRoute();
  const { vccNo } = route.params || {};
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!vccNo) return;
      try {
        const q = query(
          collection(db, 'submissions'),
          where('vccNo', '==', vccNo),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setRecord(docSnap.data());
        } else {
          alert('Record not found.');
        }
      } catch (error) {
        alert(`Error fetching record: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [vccNo]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D009D" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No record found.</Text>
      </View>
    );
  }

  const allData = [
    ['VCC No', record.vccNo || ''],
    ['VCC Status', record.vccStatus || ''],
    ['VCC Generation Date', record.vccDate ? formatDate(record.vccDate) : ''],
    ['Chassis No', record.chasisNo || ''],
    ['Engine Number', record.engineNo || ''],
    ['Year of Built', record.buildYear || ''],
    ['Vehicle Drive', record.driver || ''],
    ['Country of Origin', record.origin || ''],
    ['Engine Capacity', record.engineCapacity || ''],
    ['Carriage Capacity', record.carriageCapacity || ''],
    ['Passenger Capacity', record.passengerCapacity || ''],
    ['Vehicle Model', record.vehicleModal || ''],
    ['Vehicle Brand Name', record.brandName || ''],
    ['Vehicle Type', record.vehicleType || ''],
    ['Vehicle Color', record.color || ''],
    ['Specification Standard Name', record.specification || ''],
    ['Declaration Number', record.declarationNo || ''],
    [
      'Declaration Date',
      record.declarationDate ? formatDate(record.declarationDate) : '',
    ],
    ['Owner Code', record.ownerCode || ''],
    ['Owner Name', record.ownerName || ''],
    ['Print Remarks', record.printRemark || ''],
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={styles.title}>VCC / Vehicle Details</Text>

      {allData.map(([label, value], idx) => (
        <View style={styles.itemContainer} key={idx}>
          <Text style={styles.label}>{label} :</Text>
          <Text
            style={label === 'VCC Status' ? styles.statusValue : styles.value}
          >
            {value}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0D009D',
    marginBottom: 16,
    textAlign: 'center',
  },
  itemContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontWeight: 'bold', marginBottom: 4 },
  value: { fontSize: 16, color: '#212529' },
  statusValue: { fontSize: 16, color: 'red', fontWeight: 'bold' },
});
