import React, { useEffect, useState, useLayoutEffect} from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, FlatList} from 'react-native';
import io from 'socket.io-client';
import config from '../config';
import { useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import Icon from "react-native-vector-icons/Ionicons";
import { isToday, isSameDate, getTime } from '../fn';

export default ChatRoom = ({route, navigation}) => {

    const token = useSelector((state) => state.token);
    const userid = jwtDecode(token).userid;

    const {touserid} = route.params;

    useLayoutEffect(() => {
      navigation.setOptions({ title: route.params.title });
    }, [navigation, route.params.title]);

    // Create the Socket.IO connection
    const socket = io(config.API_URL, {
        auth: {
        token: token, // Set the actual token retrieved from Redux
        },
    });

    //user input
    const [message, setMessage] = useState('');
    //fetch messages
    const [messages, setMessages] = useState('');
    const [roomId, setRoomId] = useState(null);
    
  useEffect(() => {
    // Connect to Socket.IO when the component mounts
    socket.connect();

    socket.emit('joinChat', { user1:userid, user2:touserid});
    // console.log('join chat');

    // Listen for the 'roomJoined' event to receive the room ID from the backend
    socket.on('roomJoined', (data) => {
        const { roomId } = data;
        // console.log(`Joined chat room with room ID: ${roomId}`);
        setRoomId(roomId); // Update the component state with the room ID
      });

      socket.on('fetchMessages', (data) => {
        const { messages} = data;
        setMessages(messages)
      });

    // Clean up the connection and event subscriptions when the component unmounts
    return () => {
      socket.disconnect();
      // Unsubscribe from events if necessary
      // Example: socket.off('eventFromServer', handleEventFromServer);
    };
  }, []);

  const sendMessage = (message) => {
    // Emit the message event to the server
    const msg = message.trim();
    if (msg !== ''){
      // socket.emit('message', { message, fromuserid:userid, touserid:touserid});
      socket.emit('addMessage', { message, userid, roomId });
      setMessage('');
    }
    
  };

  return (
    <>
      <View style={{flex:1, backgroundColor:'#fff'}}>
      <Text>
        To user id: {touserid} from {userid}
      </Text>
      <Text>
        Joined chat room with room ID: {roomId}
      </Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index}) => 
        {
          const msg = item;

          // Get the current message date
          const messageDate = new Date(msg.date);

          // Get the previous message date
          const previousDate =
            index > 0 ? new Date(messages[index - 1].date) : null;

          // Determine if the current message is from today
          const isCurrentDayToday = isToday(messageDate);

          // Determine if the previous message is from today
          const isPreviousDayToday = previousDate ? isToday(previousDate) : false;

          // Initialize the messageDateLabel to store the label for the current message date
          let messageDateLabel = "";

          // Determine the messageDateLabel based on the message date and the previous message date
          if (isCurrentDayToday && !isPreviousDayToday) {
            messageDateLabel = "Today";
          } else if (!isCurrentDayToday) {
            messageDateLabel = messageDate.toDateString();
          }

          // Determine if it's the first message of the date
          const isFirstMessageOfDate = index === 0 || !isSameDate(messageDate, previousDate);

          return(
            <View key={index}>

            {isFirstMessageOfDate && (
              <Text
                style={{
                  textAlign: "center",
                  backgroundColor:'#F8F8F8'
                }}
              >
                {messageDateLabel}
              </Text>
            )}

          {/* message box */}
          <View 
          style={{
            display: "flex",
            flexDirection: "row",
            alignSelf: msg.userid === userid ? "flex-end" : "flex-start",
            margin: 10,
            marginTop:10,
            marginBottom: 5,
          }}
          >
            <TouchableOpacity
            style={{
              backgroundColor: msg.userid === userid ? '#E0E0E0' : '#F0F0F0',
              borderRadius: 20,
              borderBottomLeftRadius: msg.userid === userid ? 20 : 0,
              borderBottomRightRadius: msg.userid === userid ? 0 : 20,
              padding:10,
              alignSelf:"flex-start",
              maxWidth: "85%",
            }}
            activeOpacity={0.7}
          >
            <Text>{msg.message}</Text>
              
          </TouchableOpacity>
        
          </View>

          {/* date */}
          <Text style={{ color: "grey", 
          textAlign: msg.userid === userid ? "right" : "left", fontSize:11,
          paddingLeft: msg.userid === userid ? 0 : 10,
          paddingRight: msg.userid === userid ? 10 : 0,
          }}>
            {getTime(msg.date)}
          </Text>

          </View>
          )
              
            }}/>
      </View>

    <View
    style={{
      // position: "absolute",
      // bottom: 0,
      width: "100%",
      backgroundColor: "#fff",
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 0.5,
      borderTopColor: "lightgrey",
    }}
    >
    <TouchableOpacity
      style={{ backgroundColor: "#fff", borderRadius: 20 }} activeOpacity={.3}
      onPress={() => sendMessage(message)}
    >
      <Icon name="add-circle" size={20} color="#4267B2" />
    </TouchableOpacity>

    <TextInput
      style={{
        flex: 1,
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
        fontSize: 14,
        backgroundColor: "#F1F2F6",
        borderRadius: 20,
        maxHeight:100
      }}
      placeholder="Write a message..."
      multiline
      onChangeText={setMessage}
      value={message}
    />
    <TouchableOpacity
      style={{ backgroundColor: "#fff", borderRadius: 20 }} activeOpacity={.3}
      onPress={() => sendMessage(message)}
    >
      <Icon name="send" size={20} color="#4267B2" />
    </TouchableOpacity>
    </View>
    </>
  );
};
