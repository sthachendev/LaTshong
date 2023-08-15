import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ToastAndroid } from 'react-native';
import io from 'socket.io-client';
import config from '../config';
import { useDispatch, useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import Icon from "react-native-vector-icons/Ionicons";
import { isToday, isSameDate, getTime, getFileSize } from '../fn';
import Header from './chatRoomHeader';
import Spinner from '../custom/Spinner';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import ImageViewer from '../custom/ImageViewer';
import { ProgressBar } from 'react-native-paper';
import * as Sharing from 'expo-sharing';
const { StorageAccessFramework } = FileSystem;
import createSocket from '../socketConfig';
import { clearUnreadCount, setUnreadCount } from '../../reducers';

export default ChatRoom = ({route, navigation}) => {

  const token = useSelector((state) => state.token);
  const userid = jwtDecode(token).userid;
  const {touserid, imageurl} = route.params;
  console.log(route.params)

  const [sending, setSending] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Header title={route.params.title} imageUrl={imageurl} touserid={touserid} />,
    });
  }, [navigation, route.params.title, imageurl]);
  // Create the Socket.IO connection
  // const socket = io(config.API_URL, {
  //   auth: {
  //   token: token, // Set the actual token retrieved from Redux
  //   },
  //   });

  const dispatch = useDispatch();

  //user input
  const [message, setMessage] = useState('');
  //fetch messages
  const [messages, setMessages] = useState('');
  const [roomId, setRoomId] = useState(null);

  const [lastMessageId, setLastMessageId] = useState(null);

  const [socket, setSocket] = useState(null);

// socket.on('fetchMessages', (data) => {
//   const { messages } = data;
//   if (messages.length > 0) {
//     setLastMessageId(messages[messages.length - 1].id); // Update last message ID
//     // ...
//   }
// });

  useEffect(() => {

  const socket = createSocket(token);
  setSocket(socket)//set socket to acess outside
    // Connect to Socket.IO when the component mounts
    // socket.connect();
    //send uid to check for chat room id
    socket.emit('joinChat', { user1:userid, user2:touserid});

    // Listen for the 'roomJoined' event to receive the room ID from the backend
    socket.on('roomJoined', (data) => {
        const { roomId } = data;
        console.log(`Joined chat room with room ID: ${roomId}`);
        setRoomId(roomId); // Update the component state with the room ID
        
      socket.emit('markRoomMessagesAsRead', { roomId, userid });
      socket.emit('UnReadMessage', { roomId, userid });
      console.log(`Joined chat room with room ID: ${roomId}`);
    });

    
    socket.on('UnReadMessageResult', (data) => {

      console.log(data);
      if (data > 0) {
      // setUnreadMessages(true);
      dispatch(setUnreadCount(true))
      console.log('unread msg')
      } else {
      // setUnreadMessages(null);
      dispatch(clearUnreadCount())
      console.log('all read msg')
      }
    });

      socket.on('fetchMessages', (data) => {
        const { messages} = data;
        // setMessages(messages.reverse());
        setMessages(messages);
        console.log(messages);
        console.log(messages[messages.length - 1].id) // last message id
        // setLastMessageId(messages[messages.length - 1].id);
      });    

      socket.on('messageAdded', (data) => {
        setSending(false);
        const { id, userid, roomId, message, message_type, date, file_name, file_size, file_uri, file_type} = data;

        console.log('new message', userid, touserid, file_name, file_size, file_uri, file_type);

        setMessages((prevMessages) => [
          {
            id,
            userid,
            roomId,
            message,
            message_type,
            date,
            file_name,
            file_size,
            file_uri,
            file_type
          },
          ...prevMessages
        ]);
        
        console.log('data',data)
        // scrollToBottom();
      });

      socket.on('fetchOlderMessages', (data) => {
        const { messages } = data;
      
        console.log('Received older messages:', messages.length);
      
        messages.forEach((oldMessage) => { // Change variable name here
          const { id, userid, roomId, message, message_type, date, file_name, file_size, file_uri, file_type } = oldMessage;
      
          // console.log(
          //   'New message:',
          //   id,
          //   userid,
          //   roomId,
          //   message,
          //   message_type,
          //   date,
          //   file_name,
          //   file_size,
          //   file_uri,
          //   file_type
          // );
          console.log('olfed asd', id)
      
          // // Now you can process each individual message here
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id,
              userid,
              roomId,
              message,
              message_type,
              date,
              file_name,
              file_size,
              file_uri,
              file_type
            }
          ]);
        });
      
        // console.log('data', data);
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
    setSending(true)
    // console.log('send btn');
    if (message && message.trim() !== ''){
    // console.log('send msg');
      // socket.emit('message', { message, fromuserid:userid, touserid:touserid});
      socket.emit('addMessage', { message, userid, roomId });
      setMessage('');
    }else if (file) {
      // socket.emit('addAttachment', { file, userid, roomId });
    // console.log('send file');
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
        
          // console.log('posted')
        } catch (error) {
          console.log(error);
        }
      setFile('');
    }
  };

  const handleFetchMore = () => {
    console.log('fetchingmore messages', messages[messages.length - 1].id)
    // setLastMessageId(messages[messages.length - 1].id);

    if (messages[messages.length - 1].id) {
      socket.emit('requestOlderMessages', { roomId, lastMessageId:messages[messages.length - 1].id });
    }
  }

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
  
  const [progress, setProgress] = useState(0);

//download attachment sent in mail
const downloadPath = FileSystem.documentDirectory + (Platform.OS == 'android' ? '' : '');

const ensureDirAsync = async (dir, intermediates = true) => {
  const props = await FileSystem.getInfoAsync(dir)
  if (props.exist && props.isDirectory) {
      return props;
  }
  let _ = await FileSystem.makeDirectoryAsync(dir, { intermediates })
  return await ensureDirAsync(dir, intermediates)
}

const downloadCallback = downloadProgress => {
  const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
  setProgress(progress);
};

const downloadFile = async (fileUrl, fileName) => {
  if (Platform.OS == 'android') {
    const dir = ensureDirAsync(downloadPath);
  }

  const downloadResumable = FileSystem.createDownloadResumable(
    fileUrl,
    downloadPath + fileName,
    {},
    downloadCallback
  );

  try {
    const { uri } = await downloadResumable.downloadAsync();
    if (Platform.OS == 'android')
      saveAndroidFile(uri, fileName)
    else
      saveIosFile(uri);
  } catch (e) {
    console.error('download error:', e);
  } finally {
    // Reset the progress state to 0
    setProgress(0);
  }
}

const saveAndroidFile = async (fileUri, fileName) => {
  try {
    const fileString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      return;
    }

    try {
      await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, '*/*')
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, fileString, { encoding: FileSystem.EncodingType.Base64 });
          ToastAndroid.show("File Downloaded", ToastAndroid.SHORT);
        })
        .catch((e) => {
        });
    } catch (e) {
      throw new Error(e);
    }

  } catch (err) {
  }
}

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');

  const handleImageClick = (uri) => {
    setImageUri(uri);
    setModalVisible(true);
  };

  //download and share the file 
  const downloadAndShareFile = async (uri, file_name) => {
    const remoteUrl = uri; // Replace this with the actual file URL
    const localFileUri = FileSystem.cacheDirectory + file_name; // Replace 'yourFileName.ext' with the desired file name

    try {
      const downloadResult = await FileSystem.downloadAsync(remoteUrl, localFileUri);
      
      if (downloadResult.status === 200) {
        // File download successful
        const shareResult = await Sharing.shareAsync(downloadResult.uri);

        if (shareResult && shareResult.action === Sharing.sharedAction) {
          console.log('File shared successfully!');
        } else {
          console.log('Sharing was cancelled or failed.');
        }
      } else {
        console.log('File download failed.');
      }
    } catch (error) {
      console.error('Error while downloading or sharing the file:', error);
    }
  };

  if (!messages) return <Spinner/>

  return (
    <>
    <View style={{flex:1, 
    backgroundColor:'#fff'
    }}>

    {progress > 0 && 
    <ProgressBar
       styleAttr="Horizontal"
       indeterminate={false}
       progress={progress}
       style={{ width: '100%', height: 5 }}
       color="#1E319D"
     />
     }

    <ImageViewer uri={imageUri} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

    <FlatList
    //header is footer, the message is shown in reverse oorder
      // ref={flatListRef}
      showsVerticalScrollIndicator={false}
      // onEndReached={()=>handleFetchMore()}
      // onEndReachedThreshold={0.1}
      data={messages}
      keyExtractor={(item) => item.id}
      initialNumToRender={10}
      ListFooterComponent={()=>{
        return(
          <>
            <View style={{display:'flex', alignContent:'flex-end', justifyContent:'center', flexDirection:'row'}}>
            {/* <Image style={{ width: 200, height: 200, borderRadius:100, marginVertical:10}} source={require("../../assets/images/message.png")} /> */}
            </View>
            {/* <Text style={{textAlign:'center', fontSize:12, color:'grey'}}>---</Text>
            <Text style={{ textAlign:"justify", fontSize:12, color:'grey', padding:10}}>
            🙏 Please remember to be polite and respectful. Treat others the way you want to be treated.
            {'\n'}{'\n'}
            🚫 Avoid sharing any personal or sensitive information, such as passwords, financial details.
            {'\n'}{'\n'}
            🔒 Your privacy is important to us! Be cautious when sharing links or interacting with unknown users.
           </Text>
           <Text style={{textAlign:'center', fontSize:12, color:'grey', marginBottom:30}}>---</Text> */}
           {/* <Text/> */}
           <TouchableOpacity onPress={handleFetchMore}>
            <Text>Load More</Text>
           </TouchableOpacity>
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
        <View key={index} onFocus={() => markMessageAsRead(message.id)} // <-- Call markMessageAsRead when the user focuses on a message
        >
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
          alignSelf: msg.userid == userid ? "flex-end" : "flex-start",
          margin: 10,
          marginTop:10,
          marginBottom: 5,
        }}>    
        {msg.message_type === 'i' ? //if i --image
         <TouchableOpacity
         style={{
           backgroundColor: msg.userid == userid ? '#373B58' : '#F0F0F0',
           borderRadius: 20,
           borderBottomLeftRadius: msg.userid == userid ? 20 : 0,
           borderBottomRightRadius: msg.userid == userid ? 0 : 20,
           padding:10,
           alignSelf:"flex-start",
           maxWidth: "85%",
         }}
         activeOpacity={1} onPress={()=>{handleImageClick(`${config.API_URL}/${msg.file_uri}`)}}
         onLongPress={() => downloadAndShareFile(`${config.API_URL}/${msg.file_uri}`, msg.file_name)}
         > 
        <Image source={{uri:`${config.API_URL}/${msg.file_uri}`}} 
        style={{ width: '100%', height: undefined, aspectRatio: 1 }} // aspectRatio 1 ensures the image maintains its original size
        resizeMode="contain" // Set resizeMode to 'contain'
        />
        </TouchableOpacity>
      :
      <TouchableOpacity
        style={{
          backgroundColor: msg.userid == userid ? 'rgba(30,49,157,0.7)' : '#F0F0F0',
          borderRadius: 20,
          borderBottomLeftRadius: msg.userid == userid ? 20 : 0,
          borderBottomRightRadius: msg.userid == userid ? 0 : 20,
          padding:10,
          alignSelf:"flex-start",
          maxWidth: "85%",
        }}
        activeOpacity={1}>
        {/* t --text */}
      {msg.message_type === 't' && <Text style={{color: msg.userid == userid ? '#fff' : '#000',}}>{msg.message}</Text>}
      {msg.message_type === 'a' &&  //a mimetype aplication/*
      
      <TouchableOpacity 
      // onPress={() => Linking.openURL(`${config.API_URL}/${msg.file_uri}`)}
      onPress={() => downloadFile(`${config.API_URL}/${msg.file_uri}`, msg.file_name)}
      onLongPress={() => downloadAndShareFile(`${config.API_URL}/${msg.file_uri}`, msg.file_name)}
      >
        <Text numberOfLines={1} style={{color: msg.userid == userid ? '#fff' : '#000',}}>
          <Ionicons name="document-outline" size={20} color={msg.userid == userid ? '#fff' : '#000'}/> {msg.file_name}
        </Text>
        <Text style={{color: msg.userid == userid ? '#fff' : '#000', fontSize:12}}> 
        {getFileSize(msg.file_size)}
        </Text>
      </TouchableOpacity>
      }
            
      </TouchableOpacity>
      }
      
        </View>
{/* {console.log("Message User ID:", msg.userid)}{
console.log("Current User ID:", userid)} */}
{console.log("msg id:", msg.id)}

<Text >{msg.id}</Text>

        {/* date */}
        <Text style={{ color: "grey", 
        textAlign: msg.userid == userid ? "right" : "left", fontSize:11,
        paddingLeft: msg.userid == userid ? 0 : 10,
        paddingRight: msg.userid == userid ? 10 : 0,
        }}>
          {getTime(msg.date)} {msg.userid !== userid && msg.message_type == 'a' && ' ~ attachment'}
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

    {file ? //make to show image
      <TouchableOpacity style={{maxHeight:100, paddingHorizontal:20, display:'flex', flexDirection:'row', flex:1, backgroundColor:'#F1F2F6', marginHorizontal:10,
      borderRadius:10}} activeOpacity={1} > 
        <Ionicons name='document-outline' size={30} color='grey'/>
        <View>
        <Text style={{color:'#000', marginRight:10}} numberOfLines={1}>{file.name}</Text>
        <Text style={{color:'#000'}} numberOfLines={1}>{getFileSize(file.size)}</Text>
        </View>
      </TouchableOpacity>
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
        placeholder={sending ? 'sending...':'Write a message...'}
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
