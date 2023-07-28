import { View, Text, StyleSheet, Image } from 'react-native';
import { capitalizeFirstLetterOfParagraphs, getTimeDifference2} from '../fn';
import { memo } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import config from '../config';
import { Video } from 'expo-av';
import { capitalizeWords } from '../fn';
import { TouchableOpacity } from 'react-native';
import { useState } from 'react';
import FeedPostsOption from './feedPostsOption';
import ImageViewer from '../custom/ImageViewer';
import Ionicons from "react-native-vector-icons/Ionicons";

const FeedPosts = (({item, role, navigation, getFeedPost}) => {

  const [isModalVisible2, setIsModalVisible2] = useState(false);//bio set modal

  const [modalVisible, setModalVisible] = useState(false);//image viewer

  return(
  <View style={styles.itemContainer} >

  <ImageViewer uri={`${config.API_URL}/${item.media_uri}`} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

    <FeedPostsOption isModalVisible={isModalVisible2} setIsModalVisible={setIsModalVisible2} postby={item.postby} postid={item.id} 
    getFeedPost={getFeedPost}/>

  <View style={{ paddingVertical:10}}>
    <View style={{display:"flex", flexDirection:'row', paddingTop:10, paddingHorizontal:15}}>
      {item.imageurl !== null ? //profile image
      <Image source={{ uri: `${config.API_URL}/${item.imageurl}` }} style={{width:40, height:40,  borderRadius: 25, borderColor:"lightgrey", borderWidth:1}} />
      :
      <Ionicons name="person-circle-outline" size={45} color="grey" />
      }
      <View style={{flex:1}}>

      <View style={{ display:'flex', flexDirection:'row', justifyContent:'space-between', flex:1}}>

        <TouchableOpacity activeOpacity={0.9}
          onPress={()=>{role ? navigation.navigate('ViewProfile', { userid: item.postby}) : navigation.navigate('Login')}}>
        <Text style={{marginLeft:10, textAlignVertical:'center', fontWeight:'500', marginRight:20,
        color: "#404040", fontSize:14}} numberOfLines={1}>{capitalizeWords(item.name)}</Text>
        </TouchableOpacity>
     
        <TouchableOpacity activeOpacity={0.9}
           onPress={()=>{ role ? setIsModalVisible2(true) : navigation.navigate('Login')}}>
       <Icon name='more-vert' size={20} color='grey'/>
        </TouchableOpacity>

      </View>

        <Text style={{color:"grey", fontSize:12, textAlignVertical:'center', marginLeft:10}}>{getTimeDifference2(item.postdate)}</Text>
      </View>

    </View>
  {
    item._desc && item._desc.trim() !== '' ?
    <Text style={{  color: "#404040", textAlign:'justify', marginVertical:10, paddingHorizontal:15 }}>
    {capitalizeFirstLetterOfParagraphs(item._desc)}
  </Text>
  :
  <View style={{marginTop: 10}}/>
  }

    {item.media_type === 'i' &&
    <>
    <TouchableOpacity onPress={()=>setModalVisible(true)} activeOpacity={1}>
      <Image
        source={{ uri: `${config.API_URL}/${item.media_uri}` }}
        style={{ width: '100%', height: 250, borderColor:"lightgrey", borderWidth:1  }}
        resizeMode="cover" // This ensures the image fills the container without distorting its aspect ratio
      />    
       <Ionicons
          name="expand-outline"
          color='lightgrey'
          size={20}
          style={{ position: "absolute", bottom: 15, right: 15 }}
        />
    </TouchableOpacity>
    </>}
    
    {item.media_type === 'v' &&
    <>
        {/* <VideoPlayer  videoUri={`${config.API_URL}/${item.media_uri}`} /> */}
        <Video
            source={{ uri: `${config.API_URL}/${item.media_uri}` }}
            style={{ width: "100%", height: 200, borderRadius:5, backgroundColor:'#000' }}
            useNativeControls
            resizeMode="contain"
          />
    </>}
  </View>

</View>
  )
});

const styles = StyleSheet.create({
    itemContainer: {
      backgroundColor: '#fff',
      borderColor:"lightgrey", borderWidth:1,
      // margin:10,x
      marginBottom:5,
      // borderRadius: 5,
      // marginBottom:0,
      // borderColor:'rgba(49, 105, 210, 0.5)',
      // borderBottomWidth:0.5,
      // elevation: 2, // Add elevation for shadow effect (Android)
    },
  });

export default memo(FeedPosts);