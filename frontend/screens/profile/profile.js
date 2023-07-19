import jwtDecode from 'jwt-decode';
import { useSelector } from 'react-redux';
import UserInfo from "./userInfo";
import { useState, useEffect } from "react";
import { FlatList, Text, View, ToastAndroid } from "react-native";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import config from "../config";
import { Image } from "react-native";
import ImageViewer from "../custom/ImageViewer";
import { TouchableOpacity } from "react-native";
import Spinner from "../custom/Spinner";
import Ionicons from "react-native-vector-icons/Ionicons";

export default Profile = ({navigation}) => {
  
  const token = useSelector((state)=> state.token);
  const userid = jwtDecode(token).userid; 

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');

  const [image, setImage] = useState(null);

  const handleImageClick = () => {
    setModalVisible(true);
  };
  
  console.log(userid);

  const [data, setData] = useState([]);
  const isFocused = useIsFocused();
  
  useEffect(()=>{
    if(isFocused)
      getPost();
    return () => {
     setData('');
    };
  },[isFocused])

  const getPost = async() => {
    try {
      const res = await axios.get(`${config.API_URL}/api/get_post/${userid}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      setData(res.data)
      // console.log(res.data);
    } catch (error) {
      console.error(error)
    }
  }

  //upload image //profile image
  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('userid', userid);
      formData.append('image', {
        uri: image,
        name: 'image.png',
        type: 'image/png',
      });
    
      await axios.patch(`${config.API_URL}/api/updateProfile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
      setImage(null);
      ToastAndroid.show("Updated", ToastAndroid.SHORT);
      console.log('Updated')
    } catch (error) {
      console.log(error);
    }
  };
  
  if (!data) return <Spinner/>

// Render each item of the data array //posts
const renderItem = ({ item }) => {
  return (
    <>
    <View style={{ backgroundColor:'#fff', padding:10, borderRadius:0, marginVertical:5,
    // marginHorizontal:10, 
    // borderColor:'grey', borderWidth:.5, 
    // borderWidth:.25, borderColor:'lightgrey',
     paddingTop:15, paddingHorizontal:25,
    flex:1}}>

      <ImageViewer uri={imageUri} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

      {item._desc && <Text style={{ paddingBottom:10, color:'grey'}}>{item._desc}</Text>}

      <TouchableOpacity onPress={()=>{ setImageUri(`${config.API_URL}/${item.images}`); handleImageClick();}} activeOpacity={1}>
      <Image  source={{ uri : `${config.API_URL}/${item.images}`}}  
          style={{ flex:1, aspectRatio:4/3, borderRadius:5, borderColor:"lightgrey", borderWidth:0.5}}/>
            <Ionicons
            name="expand-outline"
            color='lightgrey'
            size={30}
            style={{position:"absolute", bottom:15, right:15}}
          />

      </TouchableOpacity>

    </View>
    </>
  );
};

//aviod using anynomus fn
const keyExtractor = (item) => item.id.toString();

  return(
    <View style={{
      // backgroundColor:"#fff",
     flex:1}}>

    {/* image upload save // cancel btn  */}
      {image && 
      <View style={{backgroundColor:'#fff', display:'flex', flexDirection:'row', paddingVertical:15, 
      justifyContent:'space-around', borderColor:"grey", borderWidth:.25}}>
        <TouchableOpacity activeOpacity={1} onPress={()=>setImage(null)}>
          <Text>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={handleUpload}>
          <Text style={{color:'#1E319D', fontWeight:"bold"}}>Save</Text>
        </TouchableOpacity>
      </View>
    }

    <FlatList
      data={data}
      ListHeaderComponent={<UserInfo userid={userid} navigation={navigation} image={image} setImage={setImage} handleUpload={handleUpload}/>}
      // ListFooterComponent={
      // <Button title="Add Cetificates" onPress={()=>navigation.navigate('ProfilePost', {userid})}></Button>
      // }
      ListEmptyComponent={()=>{
        return(
          <>
            <Image style={{ width: 400, height: 200, alignSelf:"center" }} source={require("../../assets/images/certificate.png")} />
            <Text style={{textAlign:'center', color:'grey'}}>Add certificates, stand out from competition </Text>
          </>
        )
      }}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      maxToRenderPerBatch={3} // Adjust this value based on your needs
      getItemLayout={(data, index) => (
        {length: 500, offset: 500 * index, index}
      )}
    />
    
    </View>
  )
}