import { View, Text, TouchableOpacity, TouchableHighlight, StyleSheet, FlatList, RefreshControl } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from 'react-redux';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEffect, useState, useRef} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import Posts from '../post/posts';
import Spinner from '../custom/Spinner';

export default Home = () => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [refreshing, setRefreshing] = useState(false);

  const handlePostClick = () => {
    navigation.navigate('Post');
  };

  // const token = useSelector((state) => state.token);
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

  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing to true to show the loader
    try {
      await getJobPost(); // Fetch data again
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false); // Set refreshing to false when done, to hide the loader
    }
  };

  //this to retain the faltlist position when scrolling 
  const flatListRef = useRef(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollOffset(offsetY);
  };
  
  useEffect(() => {
    if (isFocused) {
      // Load the last scroll position from AsyncStorage when the component is focused
      const loadScrollOffset = async () => {
        try {
          const lastScrollOffset = await AsyncStorage.getItem('lastScrollOffsetHome');
          if (flatListRef.current && lastScrollOffset) {
            flatListRef.current.scrollToOffset({ offset: Number(lastScrollOffset), animated: false });
          }
        } catch (error) {
          console.error('Error retrieving scroll offset:', error);
        }
      };

      loadScrollOffset();
    }
  }, [isFocused]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const lastScrollOffset = await AsyncStorage.getItem('lastScrollOffsetHome');
        if (flatListRef.current && lastScrollOffset) {
          flatListRef.current.scrollToOffset({ offset: Number(lastScrollOffset), animated: false });
        }
      } catch (error) {
        console.error('Error retrieving scroll offset:', error);
      }
    });
  
    navigation.addListener('blur', saveScrollOffset);
  
    return () => {
      saveScrollOffset();
      unsubscribe();
    };
  }, [navigation]);
  
  const saveScrollOffset = async () => {
    if (flatListRef.current) {
      const offsetY = flatListRef.current._listRef._scrollMetrics.offset;
      try {
        await AsyncStorage.setItem('lastScrollOffsetHome', String(offsetY));
      } catch (error) {
        console.error('Error saving scroll offset:', error);
      }
    }
  };

  //change color of name n job title on press,
  const [selectedItem, setSelectedItem] = useState(null);


  if (!data) {
    return <Spinner/>;
  }

 // Render each item of the data array
  const renderItem = ({ item }) => <Posts item={item} role={role} navigation={navigation} selectedItem={selectedItem} setSelectedItem={setSelectedItem}/>;

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
        ref={flatListRef}
        data={data}
        // ListFooterComponent={()=>{return(<Text style={{textAlign:'center', color:'grey'}}>{'<>'}</Text>)}}
        // ListFooterComponent={()=>{return(<View style={{margin:5}}></View>)}}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={3} // Adjust this value based on your needs
        ListEmptyComponent={()=>{
          return(
            <Text style={{textAlign:"center", marginVertical:30, color:"grey"}}>No posts</Text>
          )
        }}
        getItemLayout={(data, index) => (
          {length: 500, offset: 500 * index, index}
        )}
        onScroll={handleScroll} // Add onScroll event to track the scroll position
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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