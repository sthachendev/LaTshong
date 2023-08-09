import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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
// import createSocket from '../socketConfig';
import { setToken, setRole, setUnreadCount, clearUnreadCount } from '../../reducers'; 

export default Home = () => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [refreshing, setRefreshing] = useState(false);

  const token = useSelector((state) => state.token);
  const role = useSelector((state) => state.role);
  const userid = token ? jwtDecode(token).userid : null;
  
  const [jobPost, setJobPosts] = useState('');
  const [feedsData, setFeedsData] = useState('');
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);  
  
  const [JobPostPage, setJobPostPage] = useState(1);

  // const socket = createSocket(token);
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   socket.connect();

  //   // socket.emit('joinChat', { user1:userid, user2:0});

  //   // // Listen for the 'roomJoined' event to receive the room ID from the backend
  //   // socket.on('roomJoined', (data) => {
  //   //     const { roomId } = data;
  //   //     console.log(`Joined chat room with room ID: ${roomId}`);
  //   //     // setRoomId(roomId); // Update the component state with the room ID
        
  //   //   // socket.emit('markRoomMessagesAsRead', { roomId, userid });
  //   //   // socket.emit('UnReadMessage', { userid });
  //   //   console.log(`Joined chat room with room ID: ${roomId}`);
  //   // });

  //   //establist a socket connection
  //   socket.emit('connectUser', { userid:userid})

  //   socket.emit('UnReadMessage', { userid });

  //   socket.on('UnReadMessageResult', (unreadCount) => {

  //     console.log('data', unreadCount);
  //     if (unreadCount > 0) {
  //     // setUnreadMessages(true);
  //     dispatch(setUnreadCount(true))
  //     console.log('unread msg')
  //     } else {
  //     // setUnreadMessages(null);
  //     dispatch(clearUnreadCount())
  //     console.log('all read msg')
  //     }
  //   });
  //   return () => {
  //     socket.disconnect();
  //     // Unsubscribe from events if necessary
  //     // Example: socket.off('eventFromServer', handleEventFromServer);
  //   };
  // }, []);


  // useEffect(()=>{
  //   if(isFocused){
  //     getJobPost();
  //     getFeedPost();
  //   }

  //   console.log('home')

  //   return () => {
  //    setJobPosts('');
  //   };
    
  // },[isFocused])

  useEffect(()=>{
    getJobPost();
    getFeedPost();

  return () => {
   setJobPosts('');
  };
  
},[])

  const getJobPost = async() => {
    try {
      if (role === 'em') {//fetch job post of an user

        // setLoading(true);
        // const res = await axios.get(`${config.API_URL}/api/get_all_job_posted_by_userid/${userid}`, {
        //   params: { page: 1, pageSize: 5 },});
        // setJobPosts(res.data);
        // if (res.data) setLoading(false);

      } else { //fetch job posts post by all/ any em
        console.log('js posts fetching')

        setLoading(true);
        const res = await axios.get(`${config.API_URL}/api/get_job_post/?page=1&pageSize=5`);
        setJobPosts(res.data);
        setJobPostPage(2);
        setLoading(false);

        // if (res.data.length > 0) {
          // setJobPostPage(2); // Set page to 2 since we already fetched the first page
          // setJobPosts(res.data); // Set feedsData with the fetched data (no need to concatenate)
          // setHasMoreData(true); // Reset hasMoreData because we fetched new data
        // } else {
        //   setJobPosts([]); // If no data received, set an empty array
        //   // setHasMoreData(false); // No more data available
        // }
        // if (res.data) setLoading(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [hasMoreData, setHasMoreData] = useState(true); //inorder to handle excess fetch
  
  const loadMoreJobPosts = async () => {
    // If already loading, return to prevent multiple requests
    if (loading || !hasMoreData) {
      return;
    }
  
    setLoading(true);
  
    try {
      // Your API call here, e.g., using axios
      console.log('teter')
      const res = await axios.get(`${config.API_URL}/api/get_job_post/?page=${JobPostPage}&pageSize=5`);
      if (res.data.length > 0) {
        setJobPosts(prevPosts => [...prevPosts, ...res.data]);
        setJobPostPage(JobPostPage + 1);
      } else {
        setHasMoreData(false); // No more data available
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
//   const loadMoreJobPosts = async () => {
//     setPage(page + 1);
//     // if (loading) return; 
//     // if (loading) return; // Check if you're already loading data or if there's no more data

//     // console.log('loadMoreJobPosts')
//     // setLoading(true);
//     // console.log(JobPostPage,'JobPostPage')

//     // try {
//     //   const res = await axios.get(`${config.API_URL}/api/get_job_post`, {
//     //     params: { page: JobPostPage, pageSize: 1 },
//     //   });
//     //   if (res.data.length > 0) {
//     //     setJobPostPage(JobPostPage + 1);
//     //     setJobPosts((prevData) => [...prevData, ...res.data]);
//     //   } else {// if no data is available to fetch
//     //     // setHasMoreData(false); // No more data available
//     //   }
//     // } catch (error) {
//     //   console.error(error);
//     // } finally {
//     //   setLoading(false);
//     // }
//  };
  
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

  const loadMorePosts = async () => {//feed
    if (loading) return;
  
    setLoading(true);
    console.log('feed')
    try {
      const res = await axios.get(`${config.API_URL}/api/feed_posts`, {
        params: { page: page, pageSize: 5 },
      });
      if (res.data.length > 0) {
        setPage(page + 1); // Update page state instead of JobPostPage
        setFeedsData((prevData) => [...prevData, ...res.data]);
        console.log(res.data)
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
      setHasMoreData(true);
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

  if (!jobPost) {
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
            data={jobPost}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <Posts item={item} role={role} navigation={navigation} selectedItem={selectedItem} setSelectedItem={setSelectedItem}/>}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={()=>{
              return(
                <Text style={{textAlign:"center", marginVertical:30, color:"grey"}}>No posts</Text>
              )
            }}
            // onScroll={(event)=>{handleScroll(event);}} // Add onScroll event to track the scroll position
            // onEndReached={data.length >= 5 && !loading ? loadMoreJobPosts : null} // Call loadMoreJobPosts only when there are more posts to load and not already loading
            // onEndReached={loadMoreJobPosts} // Call loadMorePosts when the user scrolls near the end
            onEndReached={() => {
              if (!loading && hasMoreData) {
                loadMoreJobPosts();
              }
            }}
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
            ref={flatListRef}
            showsVerticalScrollIndicator={false}
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
    // backgroundColor:'rgba(30,49,157,0.1)'
    backgroundColor:'#fff'
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
    backgroundColor:'#fff'
  },
});