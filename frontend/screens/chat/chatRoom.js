import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image} from 'react-native';
import io from 'socket.io-client';
import config from '../config';
import { useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import Icon from "react-native-vector-icons/Ionicons";
import { isToday, isSameDate, getTime, getFileSize, removeBrackets } from '../fn';
import Header from './chatRoomHeader';
import Spinner from '../custom/Spinner';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';  
import ImageViewer from '../custom/ImageViewer';

export default ChatRoom = ({route, navigation}) => {

  const token = useSelector((state) => state.token);
  const userid = jwtDecode(token).userid;

  const {touserid, imageurl} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Header title={route.params.title} imageUrl={imageurl} />,
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
        const { id, userid, roomId, message, message_type, date} = data;

        console.log('new message', userid, touserid)

        setMessages((prevMessages) => [
          {
            id,
            userid,
            roomId,
            message,
            message_type,
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
    console.log('send btn');
    if (message && message.trim() !== ''){
    console.log('send msg');
      // socket.emit('message', { message, fromuserid:userid, touserid:touserid});
      socket.emit('addMessage', { message, userid, roomId });
      setMessage('');
    }else if (file) {
      // socket.emit('addAttachment', { file, userid, roomId });
    console.log('send file');
        try {
          const formData = new FormData();
          formData.append('userid', userid);
          formData.append('roomId', roomId);
          formData.append('image', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
          });
        
          axios.patch(`${config.API_URL}/api/upload_attachement`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(res=>{
            // console.log(res.data)
          })
          .catch(e=>console.log(e))
        
          console.log('posted')
        } catch (error) {
          console.log(error);
        }
      setFile('');
    }
  };

  const [file, setFile] = useState('');
  
  const pickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // You can specify the allowed file types here. For example, "image/*" for images.
      });
  
      if (result.type === 'success') {
        // You can access the selected file using the `result.uri` property.
        // You may want to store the selected file URI in state or use it directly to send the file.
        console.log('File URI:', result);
        setFile(result)
      } else if (result.type === 'cancel') {
        console.log('Document picking canceled.');
      }
    } catch (error) {
      console.log('Error while picking a document:', error);
    }
  };
  
  const downloadFile = async (uri) => {
    const fileUri =  `${config}/${uri}`;
    const fileUriParts = fileUri.split('/');
    const fileName = fileUriParts[fileUriParts.length - 1];
    const downloadResumable = FileSystem.createDownloadResumable(
      fileUri,
      FileSystem.documentDirectory + fileName,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;
        console.log(`Download progress: ${progress}`);
      }
    );
    try {
      const { uri } = await downloadResumable.downloadAsync();
      console.log(`Downloaded file: ${uri}`);
      Linking.openURL(uri);
    } catch (e) {
      console.error(e);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');

  const handleImageClick = (uri) => {
    setImageUri(uri);
    setModalVisible(true);
  };

  if (!messages) return <Spinner/>

  return (
    <>
    <View style={{flex:1, 
    backgroundColor:'#fff'
    }}>

    <ImageViewer uri={imageUri} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

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
            style={{ textAlign: "center",
              // backgroundColor:'#F8F8F8',
              color:'grey'
            }}>
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
        }}>    
        {msg.message_type === 'i' ? //if i --image
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
         activeOpacity={1} onPress={()=>{handleImageClick(`${config.API_URL}/${removeBrackets(msg.message)}`)}}> 
        <Image source={{uri:`${config.API_URL}/${removeBrackets(msg.message)}`}} 
        style={{ width: '100%', height: undefined, aspectRatio: 1 }} // aspectRatio 1 ensures the image maintains its original size
        resizeMode="contain" // Set resizeMode to 'contain'
        />
        </TouchableOpacity>
      :
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
        activeOpacity={1}>
        {/* t --text */}
      {msg.message_type === 't' && <Text style={{color: msg.userid === userid ? '#fff' : '#000',}}>{msg.message}</Text>}
      {msg.message_type === 'a' &&  //a mimetype aplication/*
      <TouchableOpacity onPress={() => Linking.openURL(`${config.API_URL}/${removeBrackets(msg.message)}`)}>
        <Text numberOfLines={1}>
          <Ionicons name='document' size={20} color='#fff'/>
        </Text>
      </TouchableOpacity>}
            
      </TouchableOpacity>
      }
      
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
    
    {!file ? 
    <TouchableOpacity
      style={{ backgroundColor: "#fff", borderRadius: 20 }} activeOpacity={.7}
      onPress={() => (pickAttachment())}>
      <Icon name="add-circle" size={30} color="#1E319D" />
    </TouchableOpacity>
    :
    <TouchableOpacity
      style={{ backgroundColor: "#fff", borderRadius: 20 }} activeOpacity={.7}
      onPress={() => (setFile(''))}
    >
      <Icon name="close" size={30} color="#1E319D" />
    </TouchableOpacity>
    }

    {file ? 
      <View style={{maxHeight:100, padding:10, display:'flex', flexDirection:'row', flex:1}}>
        <Ionicons name='document' size={20} color='#000'/>
        <View>
        <Text style={{color:'grey'}} numberOfLines={1}>{file.name}{getFileSize(file)}</Text>
        </View>
      </View>
      :
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
    }
    <TouchableOpacity
       activeOpacity={.7}
      onPress={() => sendMessage(message)}
    >
      <Icon name="send" size={30} color="#1E319D" />
    </TouchableOpacity>
    </View>
    </>
  );
};
