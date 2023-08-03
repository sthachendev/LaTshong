import { useSelector } from 'react-redux';
import UserInfo from "./userInfo";
import { useState, useEffect } from "react";
import { FlatList, Text, View, Image } from "react-native";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import config from "../config";
import ImageViewer from "../custom/ImageViewer";
import { TouchableOpacity } from "react-native";
import Spinner from "../custom/Spinner";
import Ionicons from "react-native-vector-icons/Ionicons";
// import AddCertificate from './addCertificate';
import FeedPosts from "../post/feedPosts";

export default ViewProfile = ({route, navigation}) => {

  const token = useSelector(state => state.token);

  const {userid} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');

  console.log(userid);

  const [data, setData] = useState([]);
  const [feedsData, setFeedsData] = useState('');
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState('');//fetch and set role

  useEffect(() => {
    fetchUserInfo();

    return () => {
      setRole('')
    }

  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${config.API_URL}/api/get_user_info/${userid}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      setRole(response.data[0].role);
      setLoading(false)
    console.log(response.data,'response');

    } catch (error) {
      console.error(error);
    }
  };

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
      setLoading(true)
      const res = await axios.get(`${config.API_URL}/api/get_post/${userid}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      setData(res.data)
      setLoading(false)
      // console.log(res.data);
    } catch (error) {
      console.error(error)
    }
  }

  const getFeedPost = async() => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.API_URL}/api/feed_posts/${userid}`);
      console.log('getFeedPost', res.data);
      setFeedsData(res.data)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleImageClick = () => {
    setModalVisible(true);
  };

  if (loading) return <Spinner/>

// // Render each item of the data array //posts //cetificates
const renderItem = ({ item }) => {
  return (
    <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 0, marginBottom: 5, flex: 1 }}>
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

    <ImageViewer uri={imageUri} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

    {/* show option to upload and display certificates if the usser is js */}
    {role === 'js' && 
    <FlatList
    // horizontal
    ListHeaderComponent={()=>  <UserInfo userid={userid} navigation={navigation} role={role} />}
      data={data}
      ListEmptyComponent={()=>{
        return(
          <View style={{display:'flex', marginTop:50}}>
            <Text style={{color:'grey', textAlign:'center'}}>User have not uploaded any certificates.</Text>
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
    ListHeaderComponent={()=><UserInfo userid={userid} navigation={navigation} role={role} />}
      data={feedsData}
      renderItem={({item})=><FeedPosts item={item} role={role} navigation={navigation}/>}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      maxToRenderPerBatch={3} // Adjust this value based on your needs
    />
    }
    </View>
  )
}