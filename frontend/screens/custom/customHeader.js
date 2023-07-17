import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import config from '../config';

const CustomHeader = ({ title, imageUrl }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: `${config.API_URL}/${imageUrl}` }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 40, // Adjust the width and height according to your needs
    height: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
  },
});

export default CustomHeader;
//used in chat room