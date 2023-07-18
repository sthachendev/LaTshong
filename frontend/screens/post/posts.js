import { View, Text, Image, TouchableHighlight, StyleSheet, FlatList } from 'react-native';
import { capitalizeFirstLetterOfParagraphs, capitalizeWords, getTimeDifference, getTimeDifference2, truncateName } from '../fn';
import config from '../config';
import { memo } from 'react';

const Posts = (({item, role, navigation, selectedItem, setSelectedItem}) => {
  const handleItemPress = () => {
    setSelectedItem(item.id);//onpressin change color
  };

  return(
  <TouchableHighlight style={styles.itemContainer} underlayColor="#fff" onPressIn={handleItemPress}
  onPress={() => navigation.navigate('PostDetails', { id: item.id, role })}>
    
  <View style={{paddingHorizontal:15, paddingVertical:10}}>
    <View style={{display:"flex", flexDirection:'row', paddingTop:10}}>
      {/* {item.imageurl !== null ? 
      
      <Image source={{ uri: `${config.API_URL}/${item.imageurl}` }} style={{width:40, height:40, borderRadius:25}} />
      :
      <Ionicons name="person-circle-outline" size={45} color="grey" />
      } */}
      {/* <View>
      <Text style={{
        marginLeft:10,
      textAlignVertical:'center', fontWeight:'500', color: selectedItem === item.id ? '#3E56C5' : "#404040", fontSize:14}}>{capitalizeWords(item.name)}</Text>
        <Text style={{color:"grey", fontSize:12, textAlignVertical:'center', marginLeft:10}}>~Verified Employer</Text>
      <Text style={{color:"grey", marginLeft:5, fontSize:12}}>{item.email}</Text>
      </View> */}

    </View>
    <Text style={{color:"grey",position:"absolute", top:5, right:10, fontSize:13}}>
      {item.status == 'o' && 'Open ~ '}{item.status == 'o' && getTimeDifference(item.postdate)}
      {item.status == 'c' && 'Closed ~ '}{item.status == 'c' && getTimeDifference(item.closedate)}
    </Text>
  
    <Text style={{marginTop:10, fontWeight:'500', color: selectedItem === item.id ? '#3E56C5' : "#404040", }}>
      {capitalizeWords(item.job_title)} - {capitalizeWords(item.nature)}
    </Text>
    <Text style={{marginTop:5, color:"#404040", textAlign:'justify'}} numberOfLines={7}>{capitalizeFirstLetterOfParagraphs(item.job_description)}
    </Text>
    <Text style={{marginTop:5, color:"#404040"}}>Total slot:
    <Text style={{fontWeight:"normal"}}> {item.vacancy_no}</Text>
    </Text>
    <Text style={{marginTop:5, color:"#404040"}}>Location: 
    <Text style={{fontWeight:"normal"}}> {item.location_}</Text>
    </Text>
  </View>

</TouchableHighlight>
  )
});

const styles = StyleSheet.create({
    itemContainer: {
      backgroundColor: '#fff',
      // margin:10,
      borderRadius: 5,
      marginBottom:0,
      borderColor:'rgba(49, 105, 210, 0.5)',
      borderBottomWidth:0.25,
      // elevation: 2, // Add elevation for shadow effect (Android)
    },
  });

export default memo(Posts);