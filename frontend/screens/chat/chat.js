import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image } from "react-native";
import axios from "axios";
import config from "../config";
import { useSelector } from "react-redux";
import jwtDecode from "jwt-decode";
import { capitalizeWords, getTimeDifference, getTimeDifference2 } from "../fn";
import { TouchableHighlight } from "react-native";
import { useIsFocused } from "@react-navigation/native";

const Chat = ({navigation}) => {
  const [chatRooms, setChatRooms] = useState([]);

  const token = useSelector((state) => state.token)
  const id = jwtDecode(token).userid;

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused)
      fetchChatRooms();

    return () => {
      setChatRooms([]);
    };
  }, [isFocused]);

  const fetchChatRooms = async () => {
    try {//userid id
      const response = await axios.get(`${config.API_URL}/api/chat_rooms/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      setChatRooms(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{flex:1, backgroundColor:'#fff'}}>
      <FlatList
      data={chatRooms}
      keyExtractor={(item) => item.id.toString()}
      // initialNumToRender={10}
      renderItem={({ item, index}) => {
        return(
          <TouchableHighlight key={item.id} 
          onPress={() => navigation.navigate('ChatRoom', 
          {touserid: item.user1 !== id ? item.user1 : item.user2, 
            title: item.user1 !== id ? capitalizeWords(item.user1_name) : capitalizeWords(item.user2_name),
            imageurl: item.other_user_imageurl
          })}
          underlayColor="#F1F2F6" 
          style={{backgroundColor:'#fff', borderColor:'rgba(49, 105, 210, 0.5)', borderWidth:0.25, borderTopWidth:0}}>
          <>
          
          <View style={{flexDirection:'row', padding:15, flex:1}}>
            {
              item.other_user_imageurl.length > 0 ?
              <Image source={{ uri: `${config.API_URL}/${item.other_user_imageurl}` }} style={{width:50, height:50, borderRadius:25}} />
              :
              <Ionicons name="person-circle-outline" size={45} color="grey" />
            }
            <View style={{flexDirection:'column', flex:1}}>
              <Text style={{fontWeight:"bold", fontSize:15, paddingLeft:10, textAlignVertical:'top'}}>
              {item.user1 !== id ? capitalizeWords(item.user1_name) : capitalizeWords(item.user2_name)}
              </Text>

              <View style={{flex:1, flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={{ fontSize:12, paddingLeft:10, textAlignVertical:'center', color:'grey', paddingTop:5}}>
                {item.message_by_userid === id ? 'Message Sent' : 'Message Recieved'}
                </Text>
                <Text style={{textAlign:'right', textAlignVertical:'bottom', fontSize:12, color:'grey'}}>{getTimeDifference2(item.date)}</Text>
              </View>
             
            </View>
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
