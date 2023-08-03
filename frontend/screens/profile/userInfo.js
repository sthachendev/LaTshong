import React, { useEffect, useState } from "react";
import { View, Text, Button, Image, TouchableHighlight, StyleSheet } from "react-native";
import axios from "axios";
import config from "../config";
import { capitalizeWords, getTimeDifference2 } from "../fn";
import { TouchableOpacity } from "react-native";
import ImageViewer from "../custom/ImageViewer";
import Ionicons from "react-native-vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import jwtDecode from "jwt-decode";
import * as ImagePicker from 'expo-image-picker';
import Bio from "./bio";
import Spinner from '../custom/Spinner'

export default UserInfo = ({userid, role, navigation, image, setImage, handleUpload, setIsModalVisible}) => {

  const token = useSelector(state => state.token);
  // const current_user_role = useSelector(state => state.role);
  const current_userid = token ? jwtDecode(token).userid : null;

  const [userInfo, setUserInfo] = useState('');

  const [modalVisible, setModalVisible] = useState(false);//for imageviewer modal
  const [imageUri, setImageUri] = useState('');

  const [loading, setLoading] = useState(true);

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
      setLoading(true)
      const response = await axios.get(`${config.API_URL}/api/get_user_info/${userid}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      setUserInfo(response.data);
      setLoading(false)
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

  const [isModalVisible2, setIsModalVisible2] = useState(false);//bio set modal
  const [desc, setDesc] = useState("");

  if (loading) return <Spinner/>

  return (
    <View style={{flex:1}}>
        
      <View style={{width:'100%', borderBottomRightRadius:10, borderBottomLeftRadius:10,
       backgroundColor:'#7C8EA6', height:200, display:'flex', alignSelf:'center', position:'absolute', top:0}}
       />
      
      <ImageViewer uri={imageUri} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

      {userInfo && (
        <>
          <View style={{ 
          backgroundColor:'#fff', 
          padding:10,  margin:20,
          paddingVertical:20,
          borderRadius:20,
        // borderColor:'#000', borderWidth:.25
        elevation:2
        }}>

          <View style={{display:'flex', flexDirection:"row", justifyContent:"center",}} >
      
          <TouchableOpacity onPress={()=>{userInfo[0].imageurl && setImageUri(`${config.API_URL}/${userInfo[0].imageurl}`); handleImageClick();}} 
          activeOpacity={1} 
          // style={{backgroundColor:'red'}}
          >
          {/* profile image */}
          {userInfo[0].imageurl.length > 0 ? 
          <>
          { image ? 
            <Image  source={{ uri : image }}  
            style={{width:120, height:120, borderRadius:60, borderColor:"lightgrey", borderWidth:1,}}
           />
           :
           <Image  source={{ uri : `${config.API_URL}/${userInfo[0].imageurl}`}}  
             style={{width:120, height:120, borderRadius:60, borderColor:"lightgrey", borderWidth:1,}}
            />
          }
         
          </>
          :
            <Image source={require("../../assets/images/default.png")} 
            style={{width:120, height:120, borderRadius:60,  borderColor:"lightgrey", borderWidth:1, marginTop:20}}
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

          {/* user name employee and bio */}
        <View style={{flexDirection:"column",}}>
          <Text style={{textAlign:"center", fontSize:20, marginLeft:15, marginVertical:5, fontWeight:'bold'}}>
            {capitalizeWords(userInfo[0].name)}</Text>
          <Text style={{textAlign:"center", fontSize:14, marginLeft:15, color:"grey", marginVertical:5}}>{userInfo[0].email}</Text>
          <Text style={{color:"grey", fontSize:12, textAlign:'center', marginVertical:5}}>Joined ~ {getTimeDifference2(userInfo[0].created_on)}</Text>
          </View>

        {userInfo && userid !== current_userid && //userinfo cards
           <View style={{ flex:1, display:'flex', flexDirection:'row', justifyContent:'space-around'}}>
       
           <TouchableHighlight style={styles.btn} underlayColor='#F1F2F6' 
           onPress={()=>{ navigation.navigate('ChatRoom', {touserid: userInfo[0].id, title: capitalizeWords(userInfo[0].name)})}}>
              <Text style={{ marginLeft:10,  textAlign:'center' }}>Message</Text>
            </TouchableHighlight>
    
           </View>
        }

      </View>

      {/* bio */}
      <TouchableOpacity style={{ backgroundColor:'#7E8CA7', padding:15, marginHorizontal:15, borderRadius:10, elevation:2}} 
     activeOpacity={1}>

        <Text style={{ color:"#fff", textAlign:'center',}}>
        {userInfo[0].bio ?  userInfo[0].bio : 'No Bio.'}
        </Text>

        {userid === current_userid && 
        <TouchableHighlight style={{borderColor:'rgba(30,49,157,0.7)', borderWidth:2, backgroundColor:'#fff',
        position:"absolute", bottom:0, right:0, borderRadius:5, padding:3}}  
        onPress={()=>{setIsModalVisible2(true); userInfo[0].bio && setDesc(userInfo[0].bio)}} 
          underlayColor='#F1F2F6'>
        <MaterialIcons name="create" color='#1E319D'
            size={20}
          />
        </TouchableHighlight>
        }

      </TouchableOpacity>
        </>

      )}
      {/* set bio modal */}
      <Bio isModalVisible={isModalVisible2} setIsModalVisible={setIsModalVisible2} fetchUserInfo={fetchUserInfo}
      desc={desc} setDesc={setDesc}/>

    {/* add certificate btn */}
    {role === 'js' &&
       <TouchableOpacity 
       activeOpacity={1}
       style={{paddingHorizontal:10,  justifyContent:'space-between', marginTop:20,backgroundColor:'#fff',
       flexDirection:"row",}}>
         <Text style={{fontSize:16, letterSpacing:1, padding:10}}>
           Certificates
         </Text>
         {userid === current_userid && role === 'js' &&
         <Ionicons
           name="add-circle-outline"
           color='#000'
           size={30}
           style={{alignSelf:'center'}}
           onPress={()=>setIsModalVisible(true)}
         />
       }
       </TouchableOpacity>
    }

    { role === 'em' &&
      <View 
      style={{  justifyContent:'space-between', marginTop:20,backgroundColor:'#fff',
      flexDirection:"row",}}>
        <Text style={{fontSize:16, letterSpacing:1, padding:10, paddingLeft:15 }}>
          Post
        </Text>
      </View>
    }

    </View>
  );
};

const styles = StyleSheet.create({
  btn:{
    backgroundColor:'#F1F2F6',
    paddingHorizontal:15,
    paddingVertical:10,
    borderColor:'grey',
    borderWidth:0.25,
    borderRadius:15,
    flex:.6,
    margin:10,
    // elevation:1
  }
})