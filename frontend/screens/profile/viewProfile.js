import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, FlatList, Image, TouchableOpacity} from "react-native";
import axios from "axios";
import config from "../config";
import { capitalizeWords } from "../fn";
import UserInfo from "./userInfo";
import Ionicons from "react-native-vector-icons/Ionicons";
import ImageViewer from "../custom/ImageViewer";

export default ViewProfile = ({route, navigation}) => {

  const {userid} = route.params;
  const [userInfo, setUserInfo] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    fetchUserInfo();

    return () => {
      setUserInfo('')
    }

  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/get_user_info/${userid}`);
      setUserInfo(response.data);
    console.log(response.data,'response');

    } catch (error) {
      console.error(error);
    }
  };

  const [data, setData] = useState([]);
  
  useEffect(()=>{
      getPost();
    return () => {
     setData('');
    };
  },[])

  const getPost = async() => {
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
      // marginHorizontal:10, 
      // borderColor:'grey', borderWidth:.5, 
      borderTopWidth:.25, borderColor:'grey', paddingTop:15, paddingHorizontal:25,
      flex:1}}>

        <ImageViewer uri={imageUri} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

        {item._desc && <Text style={{ paddingBottom:10}}>{item._desc}</Text>}

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

  return (
    <View>
      <Text>id: {userid}</Text>

      {userInfo ? (
        <>
          {/* profile image */}

          <Text>Name: {userInfo[0].name}</Text>
          <Text>Email: {userInfo[0].email}</Text>
          {/* Add more fields as needed */}
        
      <Button title="Message" onPress={() => navigation.navigate('ChatRoom', {touserid: userid, title: capitalizeWords(userInfo[0].name) })} />
        </>
      ) : (
        <Text>Loading user information...</Text>
      )}

<FlatList
      data={data}
      ListHeaderComponent={<UserInfo userid={userid} navigation={navigation} />}
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
  );
};

const styles = StyleSheet.create({
    buttonContainer2: {
    backgroundColor: "#fff",
    borderBottomWidth:0.5,
    borderBottomColor:"lightgrey",
    padding: 10,
    paddingHorizontal:15,
    width: "100%",
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between"
    },
    buttonText2: {
    fontSize: 16,
    fontWeight: "bold",
    },
})