import { View, Text, TouchableOpacity, TouchableHighlight, StyleSheet, FlatList } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import config from '../config';
import Posts from '../post/posts';
import Spinner from '../custom/Spinner';

export default Home = () => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const handlePostClick = () => {
    navigation.navigate('Post');
  };

  const token = useSelector((state) => state.token);
  const role = useSelector((state) => state.role);

  const [data, setData] = useState('');
  
  useEffect(()=>{
    if(isFocused)
      getJobPost();

    return () => {
     setData('');
    };
    
  },[isFocused])

  const getJobPost = async() => {
    try {
      const res = await axios.get(`${config.API_URL}/api/get_job_post`);
      // console.log('getJobPost');
      setData(res.data)
    } catch (error) {
      console.error(error)
    }
  }


  if (!data) {
    return <Spinner/>;
  }

 // Render each item of the data array
  const renderItem = ({ item }) => <Posts item={item} role={role} navigation={navigation}/>;

  //aviod using anynomus fn
  const keyExtractor = (item) => item.id.toString();

  return (
    <View style={styles.container}>
     
     {role === null && <>
        <View style={{paddingVertical:20, backgroundColor:'#fff'}}>
          <TouchableHighlight  style={{backgroundColor:"#1E319D", marginHorizontal:20, 
          paddingVertical:10, paddingHorizontal:15, borderRadius:20, elevation:2}} underlayColor='#1E319D'
          onPress={()=>navigation.navigate('Login')}>
          <Text style={{color:"#fff", fontWeight:"500", textAlign:"center"}}>Log In</Text>
          </TouchableHighlight>
        </View>
      </>}
      
      <FlatList
      data={data}
      // ListFooterComponent={()=>{return(<Text style={{textAlign:'center', color:'grey'}}>{'<>'}</Text>)}}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      maxToRenderPerBatch={3} // Adjust this value based on your needs
      getItemLayout={(data, index) => (
        {length: 500, offset: 500 * index, index}
      )}
    />

    {/* Floating Add Post Option */}
    {role === "em" && 
      <TouchableOpacity
      style={styles.floatingPost}
      onPress={handlePostClick}
      activeOpacity={.8}
    >
      <MaterialIcons name="add" size={25} color="white" />
    </TouchableOpacity>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor:'#fff'
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  floatingPost: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1E319D',
    borderRadius: 25,
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
});