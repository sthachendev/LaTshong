import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image} from 'react-native';
import io from 'socket.io-client';
import config from '../config';
import { useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import Icon from "react-native-vector-icons/Ionicons";
import { isToday, isSameDate, getTime } from '../fn';
import CustomHeader from '../custom/customHeader';
import Spinner from '../custom/Spinner';

export default ChatRoom = ({route, navigation}) => {

  const token = useSelector((state) => state.token);
  const userid = jwtDecode(token).userid;

  const {touserid, imageurl} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <CustomHeader title={route.params.title} imageUrl={imageurl} />,
    });
  }, [navigation, route.params.title, imageurl]);
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
    //send uid to check for chat room id
    socket.emit('joinChat', { user1:userid, user2:touserid});

    // Listen for the 'roomJoined' event to receive the room ID from the backend
    socket.on('roomJoined', (data) => {
        const { roomId } = data;
        // console.log(`Joined chat room with room ID: ${roomId}`);
        setRoomId(roomId); // Update the component state with the room ID
      });

      socket.on('fetchMessages', (data) => {
        const { messages} = data;
        setMessages(messages.reverse());
        // scrollToBottom();
      });    

      socket.on('messageAdded', (data) => {
        const { id, userid, roomId, message, date} = data;

        setMessages((prevMessages) => [
          {
            id,
            userid,
            roomId,
            message,
            date
          },
          ...prevMessages
        ]);
        
        console.log('data',data)
        // scrollToBottom();
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

  if (!messages) return <Spinner/>

  return (
    <>
    <View style={{flex:1, 
    backgroundColor:'#fff'
    }}>

    <FlatList
    //header is footer, the message is shown in reverse oorder
      // ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id.toString()}
      initialNumToRender={10}
      ListFooterComponent={()=>{
        return(
          <>
            <View style={{display:'flex', alignContent:'flex-end', justifyContent:'center', flexDirection:'row'}}>
            <Image style={{ width: 200, height: 200, }} source={require("../../assets/images/message.png")} />
            </View>
            <Text style={{textAlign:'center', fontSize:12, color:'grey'}}>---</Text>
            <Text style={{ textAlign:"justify", fontSize:12, color:'grey', padding:10}}>
            🙏 Please remember to be polite and respectful. Treat others the way you want to be treated.
            {'\n'}{'\n'}
            🚫 Avoid sharing any personal or sensitive information, such as passwords, financial details.
            {'\n'}{'\n'}
            🔒 Your privacy is important to us! Be cautious when sharing links or interacting with unknown users.
            {'\n'}{'\n'}
            🔧 If you encounter any issues or need assistance, feel free to reach out to the moderators or support team.
           </Text>
           <Text style={{textAlign:'center', fontSize:12, color:'grey', marginBottom:30}}>---</Text>
          </>
         
        )
      }}  
      inverted 
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

      // Determine if it's the last message of the date
      const isLastMessageOfDate =
        index === messages.length - 1 ||
        !isSameDate(messageDate, new Date(messages[index + 1].date));

      return(
        <View key={index}>

        {isLastMessageOfDate && (
          <Text
            style={{
              textAlign: "center",
              // backgroundColor:'#F8F8F8',
              color:'grey'
            }}
          >
            {messageDateLabel ? messageDateLabel : 'Today'}
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
            backgroundColor: msg.userid === userid ? '#3E56C5' : '#F0F0F0',
            borderRadius: 20,
            borderBottomLeftRadius: msg.userid === userid ? 20 : 0,
            borderBottomRightRadius: msg.userid === userid ? 0 : 20,
            padding:10,
            alignSelf:"flex-start",
            maxWidth: "85%",
          }}
          activeOpacity={0.7}
        >
          <Text style={{color: msg.userid === userid ? '#fff' : '#000',}}>{msg.message}</Text>
            
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
