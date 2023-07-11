import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import axios from "axios";
import config from "../config";
import { useSelector } from "react-redux";
import jwtDecode from "jwt-decode";
import { capitalizeWords } from "../fn";
import { TouchableHighlight } from "react-native";

const Chat = ({navigation}) => {
  const [chatRooms, setChatRooms] = useState([]);

  const token = useSelector((state) => state.token)
  const id = jwtDecode(token).userid;

  useEffect(() => {
    fetchChatRooms();

    return () => {
      setChatRooms([]);
    };
  }, []);

  const fetchChatRooms = async () => {
    try {//userid id
      const response = await axios.get(`${config.API_URL}/api/chat_rooms/${id}`);
      setChatRooms(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <FlatList
      data={chatRooms}
      keyExtractor={(item) => item.id.toString()}
      // initialNumToRender={10}
      renderItem={({ item, index}) => {
        return(
          <TouchableHighlight key={item.id} 
          onPress={() => navigation.navigate('ChatRoom', 
          {touserid: item.user1 !== id ? item.user1 : item.user2, 
            title: item.user1 !== id ? capitalizeWords(item.user1_name) : capitalizeWords(item.user2_name) })}
          underlayColor="#F1F2F6" 
          style={{backgroundColor:'#fff'}}>

          <>
          <View style={{flexDirection:'row', padding:10}}>
          <View style={{width:40, height:40, backgroundColor:"#000", borderRadius:20}}/>
            <Text style={{fontWeight:"400", fontSize:14, paddingLeft:10, textAlignVertical:'top'}}>
              {item.user1 !== id ? capitalizeWords(item.user1_name) : capitalizeWords(item.user2_name)}
              </Text>
          </View>
          {/* <Text>Chat Room ID: {item.room_id}</Text> */}
          </>

          </TouchableHighlight>
        )
      }}
      //add render if empty No conversations
      />
    </View>
  );
};

export default Chat;
