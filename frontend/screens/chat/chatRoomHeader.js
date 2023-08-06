import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import config from '../config';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showFirstWord } from '../fn';

const ChatRoomHeader = ({ title, imageUrl, touserid }) => {

  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {imageUrl?.length > 0 ? 
      <Image source={{ uri: `${config.API_URL}/${imageUrl}` }} style={styles.image} />
      :
      <Image source={require("../../assets/images/default.png")} style={styles.image} />
      }
      <TouchableOpacity onPress={()=>navigation.navigate('ViewProfile', { userid: touserid })} activeOpacity={1}>
      <Text style={styles.title} numberOfLines={1}>{showFirstWord(title)}</Text>
      </TouchableOpacity>
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

    borderRadius: 20,
    borderColor:"lightgrey", borderWidth:1
  },
  title: {
    fontSize: 20,
    fontWeight: '500',    
    paddingLeft: 10,
  },
});

export default ChatRoomHeader;
//used in chat room