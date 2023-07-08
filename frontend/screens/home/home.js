import { View, Text, TouchableOpacity, TouchableHighlight, StyleSheet, FlatList } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import config from '../config';
import Posts from './posts';

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

  const handleApply = async(postid) => {
    try {
      const res = await axios.put(`${config.API_URL}/api/update_job_post`, {
        userid: jwtDecode(token).userid, 
        postid:postid
      });
      // console.log(res.data);
      console.log('update_job_post');
      console.log(res.data);
    } catch (error) {
      console.error(error)
    }
  }

 // Render each item of the data array
const renderItem = ({ item }) => <Posts item={item} role={role} navigation={navigation} handleApply={handleApply}/>;

//aviod using anynomus fn
const keyExtractor = (item) => item.id.toString();

  return (
    <View style={styles.container}>
      <FlatList
      data={data}
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
      <MaterialIcons name="add" size={20} color="white" />
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
});