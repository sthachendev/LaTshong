import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { capitalizeWords, getTimeDifference } from '../fn';

export default Home = () => {
    const navigation = useNavigation();

  const handlePostClick = () => {
    navigation.navigate('Post');
  };

  const token = useSelector((state) => state.token);
  const userRole = useSelector((state) => state.role);

  const [role, setRole] = useState('');
  const [data, setData] = useState('');

  useEffect(()=>{
    setRole(userRole);

    getJobPost();

  },[])

  const getJobPost = async() => {
    try {
      const res = await axios.get(`${config.API_URL}/api/get_job_post`);
      // console.log(res.data);
      console.log('ok');
      setData(res.data)
    } catch (error) {
      console.error(error)
    }
  }

 // Render each item of the data array
const renderItem = ({ item }) => (
  <View style={styles.itemContainer}>
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
  
    <Text style={{marginTop:5, fontWeight:"500"}}>Job Title:  
    <Text style={{borderRadius:5, fontWeight:"normal"}}> {capitalizeWords(item.job_title)}</Text>
    </Text>
    <Text style={{marginTop:5, fontWeight:"500"}}>Description:</Text>
    <Text style={{borderRadius:5}}>{item.job_description}</Text>
    <Text style={{marginTop:5, fontWeight:"500"}}>Requirements:</Text>
    <Text style={{borderRadius:5}}>{item.job_requirements}</Text>
    <Text style={{marginTop:5, fontWeight:"500"}}>Salary:
    <Text style={{borderRadius:5, fontWeight:"normal"}}> {item.job_salary}</Text>
    </Text>
    
    <View style={{display:"flex", flexDirection:"row",justifyContent:"space-around", flex:1, marginTop:10, borderTopWidth:.5, borderColor:'grey'}}>
      <TouchableOpacity style={{  marginHorizontal:10, flex:.5}} activeOpacity={.8}>
        <Text style={{ color:'#4942E4', paddingTop:10, paddingBottom:5, textAlign:"center"}}>
        Message
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ backgroundColor:'#fff', flex:.5}} activeOpacity={.8}>
        <Text style={{ color:'#4942E4',  paddingTop:10, paddingBottom:5, textAlign:"center", fontWeight:"bold"}}>
        Apply
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

  return (
    <View style={styles.container}>
      <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />

    {/* Floating Add Post Option */}
    {role === "em" && 
      <TouchableOpacity
      style={styles.floatingPost}
      onPress={handlePostClick}
      activeOpacity={.8}
    >
      <MaterialIcons name="add" size={20} color="white" />
    </TouchableOpacity>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  floatingPost: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3a348e',
    borderRadius: 15,
    padding: 12,
    elevation: 4, // Add elevation for shadow effect
    shadowColor: 'black', // Shadow color
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 4, // Shadow radius
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 2, // Vertical offset
    },
  },
  postText: {
    color: 'white',
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 10,
    // marginHorizontal: 10,
    marginVertical:5,
    // borderRadius: 8,
    elevation: 2, // Add elevation for shadow effect (Android)
  },
});