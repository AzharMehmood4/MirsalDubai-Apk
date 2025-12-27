import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const formFields = [
  { label: 'VCC No', name: 'vccNo', type: 'text' },
  { label: 'VCC Generation date', name: 'vccDate', type: 'date' },
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
  { label: 'Declaration Date', name: 'declarationDate', type: 'date' },
  { label: 'Owner Code', name: 'ownerCode', type: 'text' },
  { label: 'Owner Name', name: 'ownerName', type: 'text' },
  { label: 'Print Remark', name: 'printRemark', type: 'text' },
  { label: 'Vcc Status', name: 'vccStatus', type: 'text' },
];

export default function AddRecordScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState(
    formFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}),
  );
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        'Authentication required',
        'Please log in to submit the form.',
      );
      return;
    }
    try {
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        userId: user.uid,
        timestamp: new Date(),
      });
      Alert.alert('Success', 'Record saved successfully!');
      // Reset form
      setFormData(
        formFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}),
      );
      navigation.goBack();
    } catch (error) {
      console.error('Error saving record:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ADD NEW RECORD</Text>

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
            value={formData[field.name]}
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
});
