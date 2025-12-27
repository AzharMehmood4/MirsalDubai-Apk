import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

const formFields = [
  { label: 'VCC No', name: 'vccNo', type: 'text' },
  { label: 'VCC Generation date', name: 'vccDate', type: 'text' },
  { label: 'Chasis No.', name: 'chasisNo', type: 'text' },
  { label: 'Engine No', name: 'engineNo', type: 'text' },
  { label: 'Vehicle Driver', name: 'driver', type: 'text' },
  { label: 'Year of build', name: 'buildYear', type: 'text' },
  { label: 'Country of origin', name: 'origin', type: 'text' },
  { label: 'Engine capacity', name: 'engineCapacity', type: 'text' },
  { label: 'Carriage capacity', name: 'carriageCapacity', type: 'text' },
  { label: 'Passenger capacity', name: 'passengerCapacity', type: 'text' },
  { label: 'Vehicle Modal', name: 'vehicleModal', type: 'text' },
  { label: 'Vehicle Brand Name', name: 'brandName', type: 'text' },
  { label: 'Vehicle Type', name: 'vehicleType', type: 'text' },
  { label: 'Vehicle Color', name: 'color', type: 'text' },
  { label: 'Specification Standard Name', name: 'specification', type: 'text' },
  { label: 'Declaration Number', name: 'declarationNo', type: 'text' },
  { label: 'Declaration Date', name: 'declarationDate', type: 'text' },
  { label: 'Owner Code', name: 'ownerCode', type: 'text' },
  { label: 'Owner Name', name: 'ownerName', type: 'text' },
];

export default function EditRecordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { vccNo } = route.params || {};
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!vccNo) {
        Alert.alert('Error', 'Invalid record ID.');
        navigation.goBack();
        return;
      }
      try {
        const q = query(
          collection(db, 'submissions'),
          where('vccNo', '==', vccNo),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setFormData(docSnap.data());
          setDocId(docSnap.id);
        } else {
          Alert.alert('Error', 'Record not found.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching record:', error);
        Alert.alert('Error', error.message);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [vccNo, navigation]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!docId) {
      Alert.alert('Error', 'Document ID not found.');
      return;
    }
    try {
      const docRef = doc(db, 'submissions', docId);
      await updateDoc(docRef, formData);
      Alert.alert('Success', 'Record updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating record:', error);
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0D009D" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>EDIT RECORD</Text>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {formFields.map((field, index) => (
        <View style={styles.fieldContainer} key={index}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            value={formData[field.name] || ''}
            onChangeText={text => handleChange(field.name, text)}
            placeholder={field.label}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D009D',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#0D009D',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: { color: '#FFF', fontWeight: 'bold' },
  fieldContainer: { marginBottom: 12 },
  label: { marginBottom: 4, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
  },
  submitButton: {
    backgroundColor: '#0D009D',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
