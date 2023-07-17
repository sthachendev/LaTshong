import React, { useEffect, useState } from "react";
import { View, Text, Button, Image, TouchableHighlight } from "react-native";
import axios from "axios";
import config from "../config";
import { capitalizeWords } from "../fn";
import { TouchableOpacity } from "react-native";
import ImageViewer from "../custom/ImageViewer";
import Ionicons from "react-native-vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from "react-redux";
import jwtDecode from "jwt-decode";

export default UserInfo = ({userid, navigation, image, setImage, handleUpload}) => {

  const token = useSelector(state => state.token)
  const current_userid = jwtDecode(token).userid;

  const [userInfo, setUserInfo] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');

  const handleImageClick = () => {
    setModalVisible(true);
  };
  useEffect(() => {
    fetchUserInfo();

    return () => {
      setUserInfo('')
    }

  }, [handleUpload]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/get_user_info/${userid}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      setUserInfo(response.data);
    console.log(response.data,'response');

    } catch (error) {
      console.error(error);
    }
  };

  const handlePickImage = async() => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    delete result.cancelled;
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }

  }

  return (
    <View style={{margin:0, marginTop:15, marginBottom:10}}>
      {userInfo ? (
        <View style={{ backgroundColor:'#fff', padding:10, 
        // borderTopLeftRadius:15, borderTopRightRadius:15,
        // borderColor:'#000', borderWidth:.25
        }}>
          <ImageViewer uri={imageUri} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

            <View style={{display:'flex', flexDirection:"row", justifyContent:"center",}} >
      
          <View 
           style={{width:"100%", height:120, backgroundColor:"lightblue", position:"absolute",
           borderTopLeftRadius:15, borderTopRightRadius:15}}
          />
          
          <TouchableOpacity onPress={()=>{ setImageUri(`${config.API_URL}/${userInfo[0].imageurl}`); handleImageClick();}} 
          activeOpacity={1} 
          // style={{backgroundColor:'red'}}
          >
          {/* profile image */}
          {image ? <Image source={{ uri: image }} 
            style={{width:120, height:120, backgroundColor:"blue", borderRadius:60, borderColor:"#fff", borderWidth:3, marginTop:60}}
            />
          :
          <Image  source={{ uri : `${config.API_URL}/${userInfo[0].imageurl}`}}  
          style={{width:120, height:120, backgroundColor:"blue", borderRadius:60, borderColor:"#fff", borderWidth:3, marginTop:60}}
         />
          }

          {/* add profile pic btn  // show if profile is of current user*/}
          {userid === current_userid && //add image btn
            <TouchableHighlight style={{borderColor:'rgba(30,49,157,0.7)', borderWidth:2, backgroundColor:'#fff',
              position:"absolute", bottom:0, right:0, borderRadius:5, padding:3}} onPress={handlePickImage} underlayColor='#F1F2F6'>
              <MaterialIcons
                  name="create"
                  color='#1E319D'
                  size={20}
                />
              </TouchableHighlight>
          }
          </TouchableOpacity>
      
        </View>
        <View style={{flexDirection:"column",}}>
          <Text style={{textAlign:"center", fontSize:20, marginLeft:15}}>{capitalizeWords(userInfo[0].name)}</Text>
          <Text style={{color:"grey", fontSize:12, textAlign:'center'}}>~Verified Job Seeker</Text>
          {/* <Text style={{textAlign:"center", fontSize:14, marginLeft:15, color:"grey"}}>asdasdasd{userInfo[0].email}</Text> */}
          </View>
          <Text style={{textAlignVertical:"center", fontSize:14, color:"grey", padding:5, marginTop:10, textAlign:'center'}}>
          Recent graduate from GCIT. Bsc. CS
          </Text>
      </View>

      ) : (
        <Text>Loading user information...</Text>
      )}
    
    {userInfo && userid !== current_userid &&
      <Button title="Message" onPress={() => navigation.navigate('ChatRoom', {touserid: userid, title: capitalizeWords(userInfo[0].name) })} />
    }


    {/* add certificate btn */}
    {userid === current_userid &&
    <TouchableOpacity onPress={()=>navigation.navigate('ProfilePost', {userid})} activeOpacity={1}
    style={{backgroundColor:"#fff", justifyContent:'space-between', flexDirection:"row",
    paddingHorizontal:5, 
    // borderColor:'grey', borderWidth:0.25,
     marginTop:15}}>
      <Text style={{textAlignVertical:"center", fontSize:14, padding:10, color:'grey'}}>
        Add Certificates / Posts
      </Text>
      <Ionicons
        name="add-circle-outline"
        color='#1E319D'
        size={30}
        style={{alignSelf:"center"}}
      />
    </TouchableOpacity>
    }
    </View>
  );
};