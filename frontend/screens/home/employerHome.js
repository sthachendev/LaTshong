import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { useNavigation } from '@react-navigation/native';

const EmployerHome = ({ token, role }) => {
    const navigation = useNavigation();

  const handlePostClick = () => {
    navigation.navigate('Post');
  };

  return (
    <View style={styles.container}>
      <Text>
        Hello, this is the EmployerHome.js, and token: {token}
      </Text>
      <Text>Role is {role}</Text>

      {/* Floating Post */}
      <TouchableOpacity
        style={styles.floatingPost}
        onPress={handlePostClick}
        activeOpacity={.8}
      >
        <MaterialIcons name="add" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  floatingPost: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3a348e',
    borderRadius: 15,
    padding: 12,
    elevation: 4, // Add elevation for shadow effect
    shadowColor: 'black', // Shadow color
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 4, // Shadow radius
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 2, // Vertical offset
    },
  },
  postText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EmployerHome;
