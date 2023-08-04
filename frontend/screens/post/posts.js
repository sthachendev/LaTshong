import { View, Text, TouchableHighlight, StyleSheet, ToastAndroid } from 'react-native';
import { capitalizeFirstLetterOfParagraphs, capitalizeWords, getTimeDifference, getTimeDifference2} from '../fn';
import { memo } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import config from '../config';

const Posts = (({item, role, navigation, selectedItem, setSelectedItem}) => {
  const handleItemPress = () => {
    setSelectedItem(item.id);//onpressin change color
  };

  const token = useSelector(state=>state.token);

  const handlePostSave = (postid) => {
    axios.post(`${config.API_URL}/api/user_saved_post`, {userid: jwtDecode(token).userid, postid: postid},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      }
    )
    .then(res=>{
      console.log(res.data.isSaved);
      if(res.data.isSaved){
      ToastAndroid.show("Post saved", ToastAndroid.SHORT);
      }else if (res.data.isSaved === false){
      ToastAndroid.show("Post Removed", ToastAndroid.SHORT);
      }

    })
    .catch(e=>console.log(e))
  }

  return(
  <TouchableHighlight style={styles.itemContainer} underlayColor="#fff" onPressIn={handleItemPress}
  onPress={() => navigation.navigate('PostDetails', { id: item.id, role })}>
    
  <View style={{paddingHorizontal:15, paddingVertical:10}}>

    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
      <Text style={{color:"grey", fontSize:13, textAlignVertical:'center'}}>
        {item.status == 'o' && 'Open ~ '}{item.status == 'o' && getTimeDifference2(item.postdate)}
        {item.status == 'c' && 'Closed ~ '}{item.status == 'c' && getTimeDifference2(item.closedate)}
      </Text>

     { token && <>
        <TouchableHighlight style={{color:"grey", fontSize:13, padding:3, borderColor:'rgba(30,49,157,0.3)', borderWidth:2, borderRadius:20}} 
        onPress={()=>handlePostSave(item.id)} 
        // underlayColor='rgba(49, 105, 210, 0.5)'
        underlayColor="#F1F2F6">
        <Icon name="bookmark-outline" size={24} color="rgba(30,49,157,0.7)" />
        </TouchableHighlight>
     </>}
    </View>
  
    <Text style={{ fontWeight:'500', color: selectedItem === item.id ? '#3E56C5' : "#404040", }}>
      {capitalizeWords(item.job_title)} - {capitalizeWords(item.nature)}
    </Text>
    <Text style={{marginTop:5, color:"#404040", textAlign:'justify'}} numberOfLines={7}>{capitalizeFirstLetterOfParagraphs(item.job_description)}
    </Text>
    
    <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', marginTop:5,}}>
    <Text style={{color:"#404040"}}>Location: {capitalizeWords(item.location_)}</Text>
    <Text style={{ color:"#404040"}}>Total slot: {item.vacancy_no}</Text>
    </View>
  </View>

</TouchableHighlight>
  )
});

const styles = StyleSheet.create({
    itemContainer: {
      backgroundColor: '#fff',
      marginVertical:0.5,
    },
  });

export default memo(Posts);