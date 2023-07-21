import axios from "axios";
import jwtDecode from "jwt-decode";
import { useEffect, useState, useRef} from "react";
import { Text, FlatList, RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import config from "../config";
import Posts from "./posts";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default AppliedList = ({navigation}) => {

    const token = useSelector(state=>state.token);
    const role = useSelector(state=>state.role);
    const userid = jwtDecode(token).userid;

    const [data, setData] = useState([]);  
    
    const [refreshing, setRefreshing] = useState(false);

    
  const onRefresh = () => {
    setRefreshing(true); // Set refreshing to true to show the loader
    try {
      getJobPost(); // Fetch data again
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false); // Set refreshing to false when done, to hide the loader
    }
  };
  
    useEffect(() => {
        getJobPost();
    },[])

    const getJobPost = () => {
    axios.get(`${config.API_URL}/api/fetch_saved_posts/${userid}`,{
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
    }).then(res => {
        console.log(res.data);
        setData(res.data);
    })
    .catch(e=>console.log(e))
    }

    const isFocused = useIsFocused();

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
  
  const [selectedItem, setSelectedItem] = useState(null);

    return(
        <>
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
        </>
    )
}