import { View, Text, TouchableHighlight, StyleSheet, Image } from 'react-native';
import { capitalizeFirstLetterOfParagraphs, getTimeDifference2} from '../fn';
import { memo } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import config from '../config';
import { Video } from 'expo-av';
// import VideoPlayer from '../custom/videoPlayer/VideoPlayer';
import { capitalizeWords } from '../fn';
import { TouchableOpacity } from 'react-native';

const FeedPosts = (({item, role, navigation}) => {

  return(
  <View style={styles.itemContainer} underlayColor="#fff">
    
  <View style={{ paddingVertical:10}}>
    <View style={{display:"flex", flexDirection:'row', paddingTop:10, paddingHorizontal:15}}>
      {item.imageurl !== null ? 
      <Image source={{ uri: `${config.API_URL}/${item.imageurl}` }} style={{width:40, height:40,  borderRadius: 25, borderColor:"lightgrey", borderWidth:1}} />
      :
      <Ionicons name="person-circle-outline" size={45} color="grey" />
      }
      <TouchableOpacity activeOpacity={0.9}
      onPress={()=>{role ? navigation.navigate('ViewProfile', { userid: item.postby}) : navigation.navigate('Login')}}>
      <Text style={{marginLeft:10, textAlignVertical:'center', fontWeight:'500',
       color: "#404040", fontSize:14}}>{capitalizeWords(item.name)}</Text>
        <Text style={{color:"grey", fontSize:12, textAlignVertical:'center', marginLeft:10}}>{getTimeDifference2(item.postdate)}</Text>
      </TouchableOpacity>

    </View>
  
    <Text style={{  color: "#404040", textAlign:'justify', marginVertical:10, paddingHorizontal:15 }}>
      {capitalizeFirstLetterOfParagraphs(item._desc)}
    </Text>

    {item.media_type === 'i' &&
    <>
        <Image
          source={{ uri: `${config.API_URL}/${item.media_uri}` }}
          style={{ width: '100%', height: 250, borderColor:"lightgrey", borderWidth:1  }}
          resizeMode="cover" // This ensures the image fills the container without distorting its aspect ratio
        />    
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