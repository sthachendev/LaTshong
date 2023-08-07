import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
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
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);  
  
  const [JobPostPage, setJobPostPage] = useState(1);

  useEffect(()=>{
    if(isFocused){
      getJobPost();
      getFeedPost();
    }

    return () => {
     setData('');
    };
    
  },[isFocused])

  const getJobPost = async () => {
    try {
      if (role === 'em') {
        setLoading(true);
        const res = await axios.get(`${config.API_URL}/api/get_all_job_posted_by_userid/${userid}`);
        setData(res.data);
        if (res.data) setLoading(false);
      } else {
        setLoading(true);
        const res = await axios.get(`${config.API_URL}/api/get_job_post`, {
          params: { page: 1, pageSize: 10 },
        });
        if (res.data.length > 0) {
          setJobPostPage(2); // Set page to 2 since we already fetched the first page
          setData(res.data); // Set feedsData with the fetched data (no need to concatenate)
        } else {
          setData([]); // If no data received, set an empty array
        }
        // if (res.data) setLoading(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreJobPosts = async () => {
    if (loading) return;
  
    setLoading(true);
    console.log(JobPostPage)
    try {
      const res = await axios.get(`${config.API_URL}/api/get_job_post`, {
        params: { page: JobPostPage + 1, pageSize: 5 },
      });
      if (res.data.length > 0) {
        setJobPostPage(JobPostPage + 1);
        setData((prevData) => [...prevData, ...res.data]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
 };
  
  const getFeedPost = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.API_URL}/api/feed_posts`, {
        params: { page: 1, pageSize: 5 },
      });
      if (res.data.length > 0) {
        setPage(2); // Set page to 2 since we already fetched the first page
        setFeedsData(res.data); // Set feedsData with the fetched data (no need to concatenate)
      } else {
        setFeedsData([]); // If no data received, set an empty array
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loading) return;
  
    setLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}/api/feed_posts`, {
        params: { page: page + 1, pageSize: 5 },
      });
      if (res.data.length > 0) {
        setPage(page + 1); // Update page state instead of JobPostPage
        setFeedsData((prevData) => [...prevData, ...res.data]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

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
  
  // const [scrollOffset, setScrollOffset] = useState(0);

  // const handleScroll = (event) => {
  //   const offsetY = event.nativeEvent.contentOffset.y;
  //   setScrollOffset(offsetY);
  // };
  
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
      <View style={styles.topTabBtnContainer}>
        
      <TouchableOpacity style={[styles.topTabBtn, {borderBottomColor: jobTabSelected ? '#1E319D' : '#F1F2F6',}]} 
      onPress={()=>setJobTabSelected(true)} activeOpacity={1}>
          <Icon name="work-outline" size={24} color={jobTabSelected ? '#1E319D' : 'grey'} />
        </TouchableOpacity> 

        <TouchableOpacity style={[styles.topTabBtn, {borderBottomColor: !jobTabSelected ? '#1E319D' : '#F1F2F6',}]}
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
            keyExtractor={(item, index) => index.toString()}
            maxToRenderPerBatch={3} // Adjust this value based on your needs
            ListEmptyComponent={()=>{
              return(
                <Text style={{textAlign:"center", marginVertical:30, color:"grey"}}>No posts</Text>
              )
            }}
            getItemLayout={(data, index) => (
              {length: 500, offset: 500 * index, index}
            )}
            // onScroll={(event)=>{handleScroll(event);}} // Add onScroll event to track the scroll position
            onEndReached={data.length >= 5 && !loading ? loadMoreJobPosts : null} // Call loadMoreJobPosts only when there are more posts to load and not already loading
            // onEndReached={loadMoreJobPosts} // Call loadMorePosts when the user scrolls near the end
            onEndReachedThreshold={0.1} // Adjust this threshold based on your preference
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={<>
              {loading && <ActivityIndicator size='small' color='#1E319D'/>}
            </>}
          />
      }

      {//news feeds posts
        !jobTabSelected &&
          <FlatList
            // ref={flatListRef}
            data={feedsData}
            renderItem={({ item }) => <FeedPosts item={item} role={role} navigation={navigation} 
            selectedItem={selectedItem} setSelectedItem={setSelectedItem} getFeedPost={getFeedPost}/>}
            keyExtractor={(item) => item.id.toString()}
            maxToRenderPerBatch={5} // Adjust this value based on your needs
            ListEmptyComponent={()=>{
              return(
                <Text style={{textAlign:"center", marginVertical:30, color:"grey"}}>No posts</Text>
              )
            }}
            getItemLayout={(data, index) => (
              {length: 500, offset: 500 * index, index}
            )}
            // onScroll={handleScroll} // Add onScroll event to track the scroll position
            onEndReached={loadMorePosts} // Call loadMorePosts when the user scrolls near the end
            onEndReachedThreshold={0.1} // Adjust this threshold based on your preference
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={<>
            {loading && <ActivityIndicator size='small' color='#1E319D'/>}
            </>}
          />
      }

    {role === 'em' && 
    <>
      <View style={styles.floatingBtnContainer}>
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
  topTabBtnContainer: {
    display:'flex',
    flexDirection:'row',
    width:'100%',
    justifyContent:'space-evenly',
    backgroundColor:'#F1F2F6',
  },
  floatingBtnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTabBtn: {
    flexDirection:'row',
    borderBottomWidth:3,
    flex:1,
    padding:10,
    justifyContent:'center',
  },
});