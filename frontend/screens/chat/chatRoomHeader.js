import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import config from '../config';

const ChatRoomHeader = ({ title, imageUrl }) => {
  return (
    <View style={styles.container}>
      {imageUrl?.length > 0 ? 
      <Image source={{ uri: `${config.API_URL}/${imageUrl}` }} style={styles.image} />
      :
      <Image source={require("../../assets/images/default.png")} style={styles.image} />
      }
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
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
    borderColor:"lightgrey", borderWidth:1
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
  },
});

export default ChatRoomHeader;
//used in chat room