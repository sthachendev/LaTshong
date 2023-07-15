import { View, Text, Image, TouchableHighlight, StyleSheet, FlatList } from 'react-native';
import { capitalizeWords, getTimeDifference, truncateName } from '../fn';
import config from '../config';
import { memo } from 'react';

const Posts = (({item, role, navigation}) => {

  return(
  <TouchableHighlight style={styles.itemContainer} underlayColor="#fff" 
  onPress={() => navigation.navigate('PostDetails', { id: item.id, role })}>
    
  <View style={{paddingHorizontal:15, paddingVertical:10}}>
    <View style={{display:"flex", flexDirection:'row', paddingTop:25}}>
      {item.imageurl !== null ? 
      
      <Image source={{ uri: `${config.API_URL}/${item.imageurl}` }} style={{width:40, height:40, borderRadius:25}} />
      :
      <Image  source={{ uri : `${config.API_URL}/uploads/123.png`}}  
        style={{width:45, height:45, backgroundColor:"blue", borderRadius:25, borderColor:"#fff", borderWidth:2}}
        />
      }
      <View style={{}}>
      <Text style={{
        marginLeft:10,
      textAlignVertical:'center', fontWeight:'500', color:"#404040", fontSize:14}}>{capitalizeWords(item.name)}</Text>
        <Text style={{color:"grey", fontSize:12, textAlignVertical:'center', marginLeft:10}}>~Verified Employer</Text>
      {/* <Text style={{color:"grey", marginLeft:5, fontSize:12}}>{item.email}</Text> */}
      </View>

    </View>
    <Text style={{color:"grey",position:"absolute", top:10, right:10, fontSize:13}}>
      {item.status == 'o' && 'Open ~ '}{item.status == 'o' && getTimeDifference(item.postdate)}
      {item.status == 'c' && 'Closed'}
    </Text>
  
    <Text style={{marginTop:10, fontWeight:'500', color:"#404040" }}>{capitalizeWords(item.job_title)} 
    <Text style={{fontWeight:'normal'}}> - {capitalizeWords(item.nature)}</Text>
    </Text>
    <Text style={{marginTop:5, color:"#404040"}}>Vacancy:
    <Text style={{fontWeight:"normal"}}> {item.vacancy_no}</Text>
    </Text>
    <Text style={{marginTop:5, color:"#404040"}}>Location: 
    <Text style={{fontWeight:"normal"}}> {item.location_}</Text>
    </Text>
    <Text style={{marginTop:5, color:"#404040"}}><Text style={{fontWeight:"normal"}}>{item.job_description}</Text>
    </Text>
  </View>

</TouchableHighlight>
  )
});

const styles = StyleSheet.create({
    itemContainer: {
      backgroundColor: '#fff',
      margin:10,
      borderRadius: 5,
      marginBottom:0,
      borderColor:'#000',
      borderWidth:0.25
      // elevation: 2, // Add elevation for shadow effect (Android)
    },
  });

export default memo(Posts);