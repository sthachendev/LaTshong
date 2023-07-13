import {  Button, TouchableHighlight} from "react-native";
import jwtDecode from 'jwt-decode';
import { useSelector } from 'react-redux';
import UserInfo from "./userInfo";
import { useState, useEffect } from "react";
import { FlatList, Text, View, Dimensions  } from "react-native";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import config from "../config";
import { Image } from "react-native";
import ImageViewer from "../custom/ImageViewer";
import { TouchableOpacity } from "react-native";

export default Profile = ({navigation}) => {
  const token = useSelector((state)=> state.token);
  const userid = jwtDecode(token).userid; 

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');

  const handleImageClick = () => {
    setModalVisible(true);
  };
  console.log(userid);

  const [data, setData] = useState([]);
  const isFocused = useIsFocused();
  
  useEffect(()=>{
    if(isFocused)
      getJobPost();
    return () => {
     setData('');
    };
  },[isFocused])

  const getJobPost = async() => {
    try {
      const res = await axios.get(`${config.API_URL}/api/get_post/${userid}`);
      setData(res.data)
      // console.log(res.data);

    } catch (error) {
      console.error(error)
    }
  }
  
// Render each item of the data array
const renderItem = ({ item }) => {
  return (
    <>
    <View style={{ backgroundColor:'#fff', padding:10, borderRadius:0, marginVertical:5,
    marginHorizontal:10, borderColor:'lightgrey', borderWidth:0.5, flex:1}}>

      <ImageViewer uri={imageUri} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

      <TouchableOpacity onPress={()=>{ setImageUri(`${config.API_URL}/${item.images}`); handleImageClick();}} activeOpacity={1}>
      <Image  source={{ uri : `${config.API_URL}/${item.images}`}}  
          style={{ flex:1, aspectRatio:4/3, borderRadius:5 }}/>
      </TouchableOpacity>

      {item._desc && <Text style={{color:"grey", padding:10}}>{item._desc}</Text>}
    </View>
    </>
  );
};

//aviod using anynomus fn
const keyExtractor = (item) => item.id.toString();

  return(
    <>
    <Button title="Add Cetificates" onPress={()=>navigation.navigate('ProfilePost', {userid})}></Button>

  <FlatList
    data={data}
    ListHeaderComponent={<UserInfo userid={userid}/>}
    renderItem={renderItem}
    keyExtractor={keyExtractor}
    maxToRenderPerBatch={3} // Adjust this value based on your needs
    getItemLayout={(data, index) => (
      {length: 500, offset: 500 * index, index}
    )}
  />
      </>
  )
}