import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEffect, useState, useRef} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import Posts from '../post/posts';
import Spinner from '../custom/Spinner';
import { FAB } from 'react-native-paper';
import ActionButton from './actionButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FeedPost from '../post/feedPost';
import jwtDecode from 'jwt-decode';
import FeedPosts from '../post/feedPosts';

export default Home = () => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [refreshing, setRefreshing] = useState(false);

  const token = useSelector((state) => state.token);
  const role = useSelector((state) => state.role);
  const userid = token ? jwtDecode(token).userid : null;
  
  const [data, setData] = useState('');
  const [feedsData, setFeedsData] = useState('');
  
  useEffect(()=>{
    if(isFocused){
      getJobPost();
      getFeedPost();
    }

    return () => {
     setData('');
    };
    
  },[isFocused])

  const getJobPost = async() => {
    try {
      const res = await axios.get(`${config.API_URL}/api/get_job_post`);
      console.log('getJobPost', res.data);
      setData(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getFeedPost = async() => {
    try {
      const res = await axios.get(`${config.API_URL}/api/feed_posts`);
      // console.log('getFeedPost', res.data);
      setFeedsData(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing to true to show the loader
    try {
      await getJobPost(); // Fetch data again
      await getFeedPost(); // Fetch data again
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
  const [jobTabSelected, setJobTabSelected] = useState(true);

  const [visible, setVisible] = useState(false);//action btn

  const handleMainButtonPress = () => {
    setVisible(!visible);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);//feed post modal

  if (!data) {
    return <Spinner/>;
  }

  return (
    <View style={styles.container}>
      {/* modal to post in feed */}
    <FeedPost isModalVisible={isModalVisible} userid={userid} setIsModalVisible={setIsModalVisible} getFeedPost={getFeedPost}/>

    {/* top tab btn */}
      <View style={{display:'flex', flexDirection:'row', width:'100%', justifyContent:'space-evenly', backgroundColor:'#F1F2F6'}}>
        
      <TouchableOpacity style={{ flexDirection:'row', borderBottomColor: jobTabSelected ? '#1E319D' : '#F1F2F6', borderBottomWidth:3,
       flex:1, padding:10, justifyContent:'center'}} 
      onPress={()=>setJobTabSelected(true)} activeOpacity={1}>
          <Icon name="work-outline" size={24} color={jobTabSelected ? '#1E319D' : 'grey'} />
        </TouchableOpacity> 

        <TouchableOpacity style={{ flexDirection:'row', borderBottomColor: !jobTabSelected ? '#1E319D' : '#F1F2F6', borderBottomWidth:3,
       flex:1, padding:10, justifyContent:'center'}}
        onPress={()=>setJobTabSelected(false)} activeOpacity={1}>
          <Icon name="article" size={24} color={!jobTabSelected ? '#1E319D' : 'grey'} />
        </TouchableOpacity> 
      </View>
      
      {//job posts
        jobTabSelected &&
          <FlatList
            ref={flatListRef}
            data={data}
            renderItem={({ item }) => <Posts item={item} role={role} navigation={navigation} selectedItem={selectedItem} setSelectedItem={setSelectedItem}/>}
            keyExtractor={(item) => item.id.toString()}
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
      }

      {//news feeds posts
        !jobTabSelected &&
          <FlatList
            ref={flatListRef}
            data={feedsData}
            renderItem={({ item }) => <FeedPosts item={item} role={role} navigation={navigation} 
            selectedItem={selectedItem} setSelectedItem={setSelectedItem} getFeedPost={getFeedPost}/>}
            keyExtractor={(item) => item.id.toString()}
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
      }

    {role === 'em' && 
    <>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <FAB
        style={{ position: 'absolute', bottom: 16, right: 15, backgroundColor:'#1E319D', borderRadius:40}}
        icon={visible ? 'close' : 'plus'}
        color='#fff'
        onPress={handleMainButtonPress}
      />
      <ActionButton
        visible={visible}
        onButton1Press={() => {
          navigation.navigate('Post');
          setVisible(false);
        }}
        onButton2Press={() => {
          setIsModalVisible(true);
          setVisible(false);
        }}
      />
      </View>
    </>}
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'rgba(30,49,157,0.1)'
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