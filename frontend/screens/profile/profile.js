import jwtDecode from 'jwt-decode';
import { useSelector } from 'react-redux';
import UserInfo from "./userInfo";
import { useState, useEffect } from "react";
import { FlatList, Text, View, ToastAndroid, Image } from "react-native";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import config from "../config";
import ImageViewer from "../custom/ImageViewer";
import { TouchableOpacity } from "react-native";
import Spinner from "../custom/Spinner";
import Ionicons from "react-native-vector-icons/Ionicons";
import AddCertificate from './addCertificate';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FeedPosts from "../post/feedPosts";

export default Profile = ({navigation}) => {
  
  const token = useSelector((state)=> state.token);
  const role = useSelector((state)=> state.role);
  const userid = token ? jwtDecode(token).userid : null;

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');

  const [image, setImage] = useState(null);

  console.log(userid);

  const [data, setData] = useState([]);
  const [feedsData, setFeedsData] = useState('');

  const isFocused = useIsFocused();
 
  useEffect(()=>{
    if(isFocused){
      getPost();
      getFeedPost();
    }
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

  const getFeedPost = async() => {
    try {
      const res = await axios.get(`${config.API_URL}/api/feed_posts/${userid}`);
      console.log('getFeedPost', res.data);
      setFeedsData(res.data)
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

  const handleImageClick = () => {
    setModalVisible(true);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setIsModalVisible(false);
    });
  
    return unsubscribe;
  }, [navigation]);

  const [jobTabSelected, setJobTabSelected] = useState(true);
  
  if (!data && !feedsData) return <Spinner/>

// // Render each item of the data array //posts //cetificates
const renderItem = ({ item }) => {
  return (
    <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 0, marginBottom: 5, flex: 1 }}>
      {/* {item._desc && <Text style={{ paddingBottom: 10, color: 'grey' }}>{item._desc}qwe</Text>} */}
      <TouchableOpacity onPress={() => { setImageUri(`${config.API_URL}/${item.images[0]}`); handleImageClick(); }} activeOpacity={1}>
        <Image
          source={{ uri: `${config.API_URL}/${item.images}` }}
          style={{ width: '100%', height: 250, borderRadius: 5, borderColor: "lightgrey", borderWidth: 0.5 }}
          resizeMode="cover" // This ensures the image fills the container without distorting its aspect ratio
        />
        <Ionicons
          name="expand-outline"
          color='lightgrey'
          size={30}
          style={{ position: "absolute", bottom: 15, right: 15 }}
        />
      </TouchableOpacity>
    </View>
  );
};

// aviod using anynomus fn
const keyExtractor = (item) => item.id.toString();

  return(
    <View style={{
      // flex:1,
    //  backgroundColor:'#fff'
    elevation:2
     }}>
    <AddCertificate isModalVisible={isModalVisible} userid={userid} setIsModalVisible={setIsModalVisible}/>

    <ImageViewer uri={imageUri} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

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

    {/* show option to upload and display certificates if the usser is js */}
    {role === 'js' && 
    <FlatList
    // horizontal
    ListHeaderComponent={()=>  <UserInfo userid={userid} navigation={navigation} image={image} setImage={setImage} 
    handleUpload={handleUpload} role={role}
    setIsModalVisible={setIsModalVisible} />}
      data={data}
      ListEmptyComponent={()=>{
        return(
          <View style={{display:'flex'}}>
            <Image style={{ width: 400, height: 200, alignSelf:"center" }} source={require("../../assets/images/certificate.png")} />
            <Text style={{textAlign:'center', color:'grey'}}>Add certificates, stand out from competition </Text>
          </View>
        )
      }}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      maxToRenderPerBatch={3} // Adjust this value based on your needs
    />
    }
     {role === 'em' && 
    <FlatList
    // horizontal
    ListHeaderComponent={()=>  <UserInfo userid={userid} navigation={navigation} image={image} setImage={setImage} 
    handleUpload={handleUpload} role={role}
    setIsModalVisible={setIsModalVisible} />}
      data={feedsData}
      renderItem={({item})=><FeedPosts item={item} role={role} navigation={navigation}/>}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      maxToRenderPerBatch={3} // Adjust this value based on your needs
      // ListFooterComponent={() => {
      //   role === 'em' && <UserFeedPosts data={feedsData} role={role} navigation={navigation} />
      // }}
    />
    }
    </View>
  )
}