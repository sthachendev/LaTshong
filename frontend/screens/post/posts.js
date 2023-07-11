import { View, Text, TouchableOpacity, TouchableHighlight, StyleSheet, FlatList } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { capitalizeWords, getTimeDifference } from '../fn';

export default Posts = (({item, role, navigation, handleApply}) => {

    return(
    <View style={styles.itemContainer}>
    <View style={{padding:10}}>
      <View style={{display:"flex", flexDirection:"row",}}>
        {item.imageurl !== null ? 
        <Image source={{ uri: `${item.imageurl}` }} style={{width:40, height:40, borderRadius:15}} />
        :
        <View style={{width:40, height:40, backgroundColor:"#000", borderRadius:20}}/>
        }
        <View>
        <Text style={{marginLeft:5, fontWeight:"bold", fontSize:14}}>{capitalizeWords(item.name)}</Text>
        <Text style={{color:"grey", marginLeft:5}}>{item.email}</Text>
        </View>

        <Text style={{color:"grey",position:"absolute", top:0, right:0}}>{getTimeDifference(item.postdate)}</Text>
      </View>
    
      <Text style={{marginTop:10, fontWeight:"500"}}>Job Title:  
      <Text style={{ fontWeight:"normal"}}> {capitalizeWords(item.job_title)}</Text>
      </Text>
      <Text style={{marginTop:5, fontWeight:"500"}}>Description:
      <Text style={{fontWeight:"normal"}}> {item.job_description}</Text>
      </Text>
      <Text style={{marginTop:5, fontWeight:"500"}}>Requirements: 
      <Text style={{fontWeight:"normal"}}> {item.job_requirements}</Text>
      </Text>
      <Text style={{marginTop:5, fontWeight:"500"}}>Salary:
      <Text style={{fontWeight:"normal"}}> {item.job_salary}</Text>
      </Text>
    </View>
    
    <View style={{display:"flex", flexDirection:"row",
    justifyContent: role !== 'em' ? "space-around": "flex-end", flex:1, margin:10, marginTop:0}}>
      {role !== 'em' &&
      <>
       <TouchableHighlight style={{ borderColor:'grey',borderWidth:0.25, flex:.25, borderRadius:25 }} underlayColor="#F1F2F6"  
      onPress={()=>handleApply(item.id)}
      >
        <Text style={{ paddingVertical:10,  textAlign:"center", color:'grey' }}>
          <MaterialIcons name="mail" size={20} color="lightgrey" />
        </Text>
      </TouchableHighlight>
   
      <TouchableHighlight style={{borderColor:'grey',borderWidth:0.25, flex:.25, borderRadius:25}} underlayColor="#F1F2F6"  
      onPress={()=>handleApply(item.id)}
      >
        <Text style={{ paddingVertical:10,  textAlign:"center", color:'grey' }}>
          <MaterialIcons name="mail" size={20} color="lightgrey" />
        </Text>
      </TouchableHighlight>

      <TouchableHighlight style={{ borderColor:'grey',borderWidth:0.25, flex:.25, borderRadius:25}} underlayColor="#F1F2F6"  
      onPress={()=>handleApply(item.id)}>
        <Text style={{ paddingVertical:10,  textAlign:"center", color:'grey' }}>
        Apply
        </Text>
      </TouchableHighlight>
      </>
      }

    {
      role === 'em' &&
      <TouchableHighlight style={{ borderColor:'grey',borderWidth:0.25, flex:.25, borderRadius:25}} underlayColor="#F1F2F6"  
      onPress={() => navigation.navigate('PostDetails', { id: item.id })}
      >
        <Text style={{ paddingVertical:10,  textAlign:"center", color:'grey' }}>
        View
        </Text>
      </TouchableHighlight>
    } 

    </View>
  </View>
    )
});

const styles = StyleSheet.create({
    itemContainer: {
      backgroundColor: '#fff',
      margin:10,
      borderRadius: 5,
      marginBottom:0,
      elevation: 2, // Add elevation for shadow effect (Android)
    },
  });