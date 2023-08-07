import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, TouchableOpacity } from 'react-native';
import SearchBar from 'react-native-dynamic-search-bar';
import { Icon } from '@rneui/themed';
import { firebase } from '../../firebase/config';
import { capitalizeWords } from '../fn/fn';

const UserManagement = () => {
  const [searchValue, setSearchValue] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [suspendedUserCount, setSuspendedUserCount] = useState(0);

  const [users, setUsers] = useState('');

  const fetchFirestoreData = async () => {
    try {
      const firestore = firebase.firestore();
      const usersRef = firestore.collection('users');
  
      // Fetch posts data
      const Snapshot = await usersRef.get();
      const userData = Snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Count the number of suspended users
      const suspendedUserCount = userData.reduce(
        (count, user) => (user.isSuspended ? count + 1 : count),
        0
      );
  
      setSuspendedUserCount(suspendedUserCount);
      console.log(userData);
      setUsers(userData);
      
      // Continue with any additional processing or state updates you require
    } catch (error) {
      console.error('Error fetching Firestore data:', error);
    }
  };

  useEffect(()=>{
    fetchFirestoreData();
  },[])

  const searchFunction = (text) => {
    const filteredUser = users.filter((item) => {
      const item_name = `${item.firstName.toUpperCase()+item.lastName.toUpperCase()}`;
      const item_email = `${item.email.toUpperCase()}`;
      const text_data = text.toUpperCase();
      return item_name.indexOf(text_data) > -1 || item_email.indexOf(text_data) > -1;
    });
    setUsers(filteredUser);

    if (text==='')
    fetchFirestoreData();

    setSearchValue(text);
  };

  const handleDeleteButtonPress = (userId) => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async() => {
            setDeleting(true);
            try {
              // Delete the user from Firebase Authentication
              // await firebase.auth().deleteUser(userId);
              
              // Delete the user from the Firestore collection 'users'
              await firebase.firestore().collection('users').doc(userId).delete();
              
              // Fetch updated Firestore data
              fetchFirestoreData();
              
              // Show a success message or perform any additional actions
              console.log('User deleted successfully');
            } catch (error) {
              console.error('Error deleting user:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  const Message = () => {
    const [visible, setVisible] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
  
      return () => clearTimeout(timer);
    }, []);
  
    if (!visible) {
      return null;
    }
  
    return (
      <View style={{ justifyContent: 'center' }}>
        <View style={{ backgroundColor: 'lightgreen', padding: 10, borderRadius: 5 }}>
          <Text style={{ fontWeight: 'bold' }}>User Deleted</Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>

      <View style={{ padding: 5 }}>
        <View style={{ flexDirection: 'row', columnGap: 16, padding: 5, marginVertical:10}}>
          <View style={styles.card}>
            <View style={styles.iconsView}>
              <Icon name="group" color={'green'} size={30} style={styles.icons} />
            </View>
            <View style={styles.details}>
              <Text style={styles.textFonts2}>Total User</Text>
              <Text style={styles.textFonts1}>{users.length}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.iconsView}>
              <Icon name="person-remove" color={'red'} size={30} style={styles.icons} />
            </View>
            <View style={styles.details}>
              <Text style={styles.textFonts2}>Suspend Users</Text>
              <Text style={styles.textFonts1}>{suspendedUserCount}</Text>
            </View>
          </View>
        </View>

        <View style={{marginVertical:10}}>
          <SearchBar
            placeholder="Search"
            style={styles.search}
            value={searchValue}
            onChangeText={(text) => searchFunction(text)}
            autoCorrect={true}
          />
        </View>
      </View>
      <View>
       
      </View>

      {deleting && (
        <Message />
      )}

      <View style={{ paddingHorizontal: 5, marginTop: 10 }}>
        <View
          style={[
            styles.table_body_single_row,
            { backgroundColor: 'black', borderTopStartRadius: 5, borderTopEndRadius: 5 },
          ]}
        >
          <View style={{ width: '6%', alignItems: 'center', paddingVertical: 3 }}>
            <Text style={styles.table_head}>ID</Text>
          </View>
          <View style={{ width: '34%', alignItems: 'center', paddingVertical: 3 }}>
            <Text style={styles.table_head}>Name</Text>
          </View>
          <View style={{ width: '46%', alignItems: 'center', paddingVertical: 3 }}>
            <Text style={styles.table_head}>Email</Text>
          </View>
          <View style={{ width: '14%', alignItems: 'center', paddingVertical: 3 }}>
            <Text style={styles.table_head}>Action</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          return (
            <View style={{ paddingHorizontal: 10 }}>
              <View style={styles.table_body_single_row}>
                <View style={{ width: '5%', alignItems: 'center' }}>
                  <Text style={styles.table_data}>{index+1}</Text>
                </View>
                <View style={{ width: '36%', alignItems: 'center' }}>
                  <Text style={[styles.table_data, { fontWeight: 'bold' }]}>{capitalizeWords(item.firstName) + '' + capitalizeWords(item.lastName)}</Text>
                </View>
                <View style={{ width: '47%', alignItems: 'center' }}>
                  <Text style={styles.table_data}>{item.email}</Text>
                </View>
                <View style={{ width: '12%', alignItems: 'center' }}>
                  <TouchableOpacity onPress={()=>handleDeleteButtonPress(item.id)}>
                    <Icon name="delete" color={'red'} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default UserManagement;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  search: {
    width: '100%',
    backgroundColor:'#F2F6F8',
  },
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 4.68,
    elevation: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 10,
    width: '47.5%',
    alignItems: 'center',
  },
  details: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
    paddingBottom: 10,
  },
  iconsView: {
    width: '79%',
  },
  icons: {
    borderWidth: 2,
    borderColor: 'white',
    padding: 5,
    borderRadius: 200,
    backgroundColor: 'white',
  },
  textFonts1: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8a8e93',
  },
  textFonts2: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8a8e93',
  },
  table_body_single_row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#8a8e93',
    paddingVertical: 15,
    paddingHorizontal:20
  },
  table_data: {
    fontSize: 11,
  },
  table_head: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
});
