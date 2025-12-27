import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { db, auth } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function ViewScreen() {
  const navigation = useNavigation();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(50);

  // Fetch data in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'submissions'),
      snapshot => {
        const fetchedRecords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(fetchedRecords);
      },
      error => {
        console.error('Error fetching records:', error);
        Alert.alert('Error fetching records', error.message);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleAddNew = () => navigation.navigate('AddRecord');

  const EditRecord = vccNo => navigation.navigate('EditRecord', { vccNo });
  const ViewRecord = vccNo => navigation.navigate('ViewFile', { vccNo });

  const DeleteRecord = async vccNo => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!auth.currentUser) {
                Alert.alert(
                  'Authentication required',
                  'Please log in to delete records.',
                );
                return;
              }
              const q = query(
                collection(db, 'submissions'),
                where('vccNo', '==', vccNo),
              );
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await deleteDoc(docRef);
                Alert.alert('Deleted', `Record ${vccNo} deleted successfully.`);
              } else {
                Alert.alert('Not found', 'No record found to delete.');
              }
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
    );
  };

  // Filter records
  const filteredRecords = records.filter(
    r =>
      r.vccNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.chasisNo?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Paginate
  const displayedRecords = filteredRecords.slice(0, entriesPerPage);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>VCC LIST SITE</Text>

      <View style={styles.topRow}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Text style={styles.addButtonText}>+ Add new</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Entries per page selection */}
      <View style={styles.pagination}>
        {[10, 25, 50, 100].map(num => (
          <TouchableOpacity
            key={num}
            onPress={() => setEntriesPerPage(num)}
            style={styles.pageButton}
          >
            <Text
              style={
                entriesPerPage === num
                  ? styles.pageButtonActiveText
                  : styles.pageButtonText
              }
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Records list */}
      <FlatList
        data={displayedRecords}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.recordCard}>
            <Text style={styles.recordText}>VCC No: {item.vccNo}</Text>
            <Text style={styles.recordText}>
              Gen Date:{' '}
              {item.vccDate ? new Date(item.vccDate).toLocaleDateString() : ''}
            </Text>
            <Text style={styles.recordText}>Chasis No: {item.chasisNo}</Text>
            <Text style={styles.recordText}>Engine No: {item.engineNo}</Text>
            <Text style={styles.recordText}>Brand: {item.brandName}</Text>
            <Text style={styles.recordText}>Owner Code: {item.ownerCode}</Text>
            <Text style={styles.recordText}>
              Date Added:{' '}
              {item.timestamp
                ? item.timestamp.toDate().toLocaleDateString()
                : ''}
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#0D009D' }]}
                onPress={() => ViewRecord(item.vccNo)}
              >
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FFC107' }]}
                onPress={() => EditRecord(item.vccNo)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#DC3545' }]}
                onPress={() => DeleteRecord(item.vccNo)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#0D009D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: { color: '#FFF', fontWeight: 'bold' },
  searchInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    flex: 1,
    marginLeft: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pageButton: { marginHorizontal: 8, padding: 6 },
  pageButtonText: { color: '#0D009D' },
  pageButtonActiveText: {
    color: '#FFF',
    backgroundColor: '#0D009D',
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  recordCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  recordText: { fontSize: 14, marginBottom: 2 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  actionText: { color: '#FFF', fontWeight: 'bold' },
});
