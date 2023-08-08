import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableHighlight, StyleSheet, Alert, Dimensions,
 FlatList, Image, ToastAndroid, RefreshControl } from "react-native";
import axios from "axios";
import config from "../config";
import { capitalizeFirstLetterOfParagraphs, capitalizeWords, getTimeDifference, getTimeDifference2 } from "../fn";
import jwtDecode from "jwt-decode";
import { useSelector } from "react-redux";
import Spinner from "../custom/Spinner";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default PostDetails = ({ route, navigation }) => {
  
  const { id, role } = route.params;//post id

  const [data, setData] = useState('');
  const [usersData, setUserData] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [acceptedApplicants, setAcceptedApplicants] = useState([]);

  const [isApply, setIsApply] = useState(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const token = useSelector((state)=>state.token);
  const userid = token ? jwtDecode(token).userid : null;

  const [postStatus, setPostStatus] = useState(true);

  useEffect(() => {
    console.log('userid',id);
    if(id)
      getJobPost();

    return () => {
      setData('');
      setUserData('');
     };
     
  }, []);

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

const getJobPost = async () => {
  try {//post id
    setLoading(true);
      const res = await axios.get(`${config.API_URL}/api/get_job_post/${id}`);//no need to add token
      setData(res.data);
      setPostStatus(res.data[0].status);
    setLoading(false);
    // console.log(res.data[0].postby);
    const applicants = res.data[0].applicants;
    const accepted_applicants = res.data[0].accepted_applicants;

    if(applicants.includes(userid)) setIsApply(true)

    if ( role === 'em' && role !== 'js' ){
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/get_user_info_`, {
        params: {
          applicants: applicants,
          acceptedApplicants: accepted_applicants,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });

      const applicants2 = response.data.applicants ?? []; // Set applicants to an empty array if it's undefined or null
      const acceptedApplicants2 = response.data.acceptedApplicants ?? []; // Set acceptedApplicants to an empty array if it's undefined or null

      setUserData(applicants2);
      setApplicants(applicants2);
      setAcceptedApplicants(acceptedApplicants2);
      // console.log(applicants2,'applicants2')
      // console.log(acceptedApplicants2,'acceptedApplicants2')
    }

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

const handleApply = async (postid) => {
  try {
    if (token) {
      const res = await axios.put(
        `${config.API_URL}/api/update_job_post`,
        {
          userid: jwtDecode(token).userid,
          postid: postid
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      console.log('update_job_post',res.data.isApply);
      if(res.data.isApply){
        setIsApply(true);
      }else if (res.data.isApply === false) {
        setIsApply(false);
      }
    } else {
      navigation.navigate('Login');
    }
  } catch (error) {
    console.error(error);
  }
}

const handleMessage = (touserid, tousername) => {
  if (token) {
    navigation.navigate('ChatRoom', 
    {touserid: touserid, title: capitalizeWords(tousername)})
  }else{
    navigation.navigate('Login');
  }
}
  
  const [selectedOption, setSelectedOption] = useState("p");

  // all accept pending rejected
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if(option === 'p'){
        console.log(option);
        setUserData(applicants);
      }else if(option === 'a'){
        console.log(option);
        setUserData(acceptedApplicants);
      }
  }

  //open and close posts btn
  const handlePostStatus = (status) => {
    Alert.alert(
      status === 'o' ? "Do you want to close the post?" : 'Do you want to open the post?',
      status === 'o' ? "Job seeker won't be able to apply for this job." : 'Job seeker will be able apply for this job.',
      [
          {
              text: status === 'o' ? "Close" : 'Re-open',
              onPress: async() => {
                  try {
                    axios.put(`${config.API_URL}/api/update_job_post_status/${id}`,{}, {
                      headers:{
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                      }
                    })
                    .then(res=>{
                      console.log(res.data);
                      getJobPost();
                    })
                    .catch(e=>console.log(e))
                  } catch (error) {
                    console.error('Error deleting post:', error);
                  }
              },
            },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
      
  }

  //post delete options
  const Option = (postby_userid) => {
    Alert.alert(
      "Do you want to delete the post?",
      "Once deleted, you can not undo it.",
      [
        // userid === postby_userid ? 
          {
              text: "Delete",
              onPress: async() => {
                  try {
                    axios.delete(`${config.API_URL}/api/delete_job_post/${id}`,{
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      }
                    })
                    .then(res=>{
                      console.log(res.data);
                      ToastAndroid.show("Post deleted", ToastAndroid.SHORT);
                      navigation.goBack()
                    })
                    .catch(e=>console.log(e))
                  } catch (error) {
                    console.error('Error deleting post:', error);
                  }
              },
            },
          // : {
          //   text: "Report",
          //   onPress: () => {
          //     handleReport();
          //   },
          // },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  //update the applicants list and put the user in accept lists
  const handleUserSelect = (userId) => {
    console.log(userid)
    const jobPostId = id;
    axios.put(`${config.API_URL}/api/move_user_to_accepted/${jobPostId}/${userId}`,{},{
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    })
    .then(res=>{
      console.log(res.data);
      // ToastAndroid.show("Selected", ToastAndroid.SHORT);
      //getJobPost();//instead of fetching the data, remove the add from applicants and add to accept array

      // Instead of using `applicants` and `acceptedApplicants` directly,

      // Instead of using `applicants` and `acceptedApplicants` directly,
      // modify the state directly to trigger a re-render
      if (selectedOption === 'p') {
        setUserData((prevApplicants) => {
          const indexToRemove = prevApplicants.findIndex((applicant) => applicant.id === userId);
          if (indexToRemove !== -1) {
            const removedItem = prevApplicants[indexToRemove];
            setAcceptedApplicants((prevAcceptedApplicants) => [...prevAcceptedApplicants, removedItem]);
            setApplicants((prev) => prev.filter((applicant) => applicant.id !== userId));
            ToastAndroid.show("Selected", ToastAndroid.SHORT);
            return prevApplicants.filter((_, index) => index !== indexToRemove);
          }
          return prevApplicants;
        });
      } else if (selectedOption === 'a') {
        setUserData((prevAcceptedApplicants) => {
          const indexToRemove = prevAcceptedApplicants.findIndex((applicant) => applicant.id === userId);
          if (indexToRemove !== -1) {
            const removedItem = prevAcceptedApplicants[indexToRemove];
            setApplicants((prevApplicants) => [...prevApplicants, removedItem]);
            setAcceptedApplicants((prev) => prev.filter((applicant) => applicant.id !== userId));
            ToastAndroid.show("Un-selected", ToastAndroid.SHORT);
            return prevAcceptedApplicants.filter((_, index) => index !== indexToRemove);
          }
          return prevAcceptedApplicants;
        });
      }
      
    })
    .catch(e=>console.log(e))
  }

  //this to retain the faltlist position when scrolling 
  const flatListRef = useRef(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollOffset(offsetY);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const lastScrollOffset = await AsyncStorage.getItem('lastScrollOffset');
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
        await AsyncStorage.setItem('lastScrollOffset', String(offsetY));
      } catch (error) {
        console.error('Error saving scroll offset:', error);
      }
    }
  };

  const handlePostSave = (postid) => {
    axios.post(`${config.API_URL}/api/user_saved_post`, {userid: jwtDecode(token).userid, postid: postid},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      }
    )
    .then(res=>{
      console.log(res.data.isSaved);
      if(res.data.isSaved){
      ToastAndroid.show("Post saved", ToastAndroid.SHORT);
      }else if (res.data.isSaved === false){
      ToastAndroid.show("Post Removed", ToastAndroid.SHORT);
      }

    })
    .catch(e=>console.log(e))
  }

  const handleReport = async (postid) => {
    console.log(postid)
    try {
    const res = await axios.post(`${config.API_URL}/api/add_reportedby_job_post/${postid}/${userid}`,{}, {
    headers: {
        Authorization: `Bearer ${token}`,
        }
    });
    console.log(res.status)
    if (res.status === 200){
        ToastAndroid.show("Post Reported", ToastAndroid.SHORT);
    }       
    } catch (error) {
    console.log(error.response.data);
    }
  };

  const SCREEN_WIDTH = Dimensions.get('window').width;

  if (loading) {
    return <Spinner />;
  }
  
  {/* Display the fetched post data  and menu bar */}
  const PostDetailsInfo = () => {
    return (
      <>
      {/* post detail container */}
      {data && (
      <>
        <View style={{padding:10, backgroundColor:"#fff",  borderColor:'lightgrey',
        borderWidth:0.5, marginHorizontal:5, marginTop:15, marginBottom:0, borderRadius:5}}>

        <View style={{display:'flex', flexDirection:'row', justifyContent:'flex-end', marginBottom:5}}>
          <Text style={{color:"grey", fontSize:12, textAlignVertical:'center', marginLeft:5}}>
            {data[0].status == 'o' && 'Open ~ '}{data[0].status == 'o' && getTimeDifference(data[0].postdate)}
            {data[0].status == 'c' && 'Closed ~ '}{data[0].status == 'c' && getTimeDifference(data[0].closedate)}</Text>
            
        </View>
      
      {/* user dp and name */}
      <View style={{display:"flex", flexDirection:"row",}}>

        {data[0].imageurl.length > 0 ? 
        <Image source={{ uri: `${config.API_URL}/${data[0].imageurl}` }} style={{width:40, height:40, borderRadius:25, borderColor:"lightgrey", borderWidth:1,}} />
        :
        <Image source={require("../../assets/images/default.png")} 
        style={{width:40, height:40, borderRadius:20,  borderColor:"lightgrey", borderWidth:1, marginLeft:5}}
        />
        }

        <View>
        <Text style={{marginLeft:10, fontWeight:"bold", fontSize:14}}>{capitalizeWords(data[0].name)}</Text>
        <Text style={{marginLeft:10, color:"grey", fontSize:12}}>{data[0].email}</Text>
        </View>

      </View>
      
      {/* job details */}
      <View style={styles.container}>

        <Text style={{ paddingLeft:0, padding:10, fontWeight:'bold'}}>{capitalizeWords(data[0].job_title)}</Text>
        <Text style={{ paddingLeft:0, padding:10, paddingTop:0, color:'#404040', textAlign:'justify'}}>{capitalizeFirstLetterOfParagraphs(data[0].job_description)}</Text>

        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Requirements</Text>
          <Text style={styles.cell}>{capitalizeFirstLetterOfParagraphs(data[0].job_requirements)}</Text>
        </View> 
        
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Job Type</Text>
          <Text style={styles.cell}>{capitalizeWords(data[0].nature)}</Text>
        </View> 
        
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Location</Text>
          <Text style={styles.cell}>{capitalizeFirstLetterOfParagraphs(data[0].location_)}</Text>
        </View> 
        
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Salary</Text>
          <Text style={styles.cell}>{data[0].job_salary}</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Slot</Text>
          <Text style={styles.cell}>{data[0].vacancy_no}</Text>
        </View> 

        <View style={[styles.tableRow,{borderBottomWidth:0}]}>
          <Text style={styles.headerCell}>Remarks</Text>
          <Text style={styles.cell}>{data[0]?.remarks === "" ? "-" : capitalizeFirstLetterOfParagraphs(data[0].remarks)}</Text>
        </View>

      </View>

     <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
     <Text style={{fontSize:12, color:'#404040', paddingLeft:5}}>Total Applicant: {data[0].applicants.length}</Text>
     </View>
      </View>

      <View style={{ width:'100%',
        display:"flex", flexDirection:"row", padding:10, paddingVertical:15, marginTop:10,
        justifyContent: role !== 'em' ? "space-around": "flex-end"}}>
          {role !== 'em' &&
            <>
            <TouchableHighlight style={{ backgroundColor:'#fff', borderColor:'rgba(30,49,157,0.7)',borderWidth:0.25, flex:.45, borderRadius:25 }} underlayColor="#F1F2F6"  
            onPress={()=>{token ? navigation.navigate('ViewProfile', { userid: data[0].postby }) : navigation.navigate('Login')}}
            >
              <Text style={{ paddingVertical:10,  textAlign:"center", color:'rgba(30,49,157,0.7)' }}>
                View Profile
              </Text>
            </TouchableHighlight>
        
            <TouchableHighlight style={{borderColor:'rgba(30,49,157,0.7)',borderWidth:0.25, flex:.45, borderRadius:25}} underlayColor="#F1F2F6"  
            onPress={()=>handleMessage(data[0].postby, data[0].name)}
            >
              <Text style={{ paddingVertical:10,  textAlign:"center", color:'rgba(30,49,157,0.7)' }}>
                {/* <MaterialIcons name="mail" size={20} color="lightgrey" /> */}
                Message
              </Text>
            </TouchableHighlight>

            </>
            }

        </View> 

        {/* report btn */}
        <View style={{ width:'100%', 
        display:"flex", flexDirection:"row", padding:15, paddingVertical:10,
        justifyContent: role !== 'em' ? "space-around": "flex-end"}}>
          {role !== 'em' &&
            <TouchableHighlight style={{ backgroundColor:'#fff', flex:1, borderRadius:5, display:'flex', flexDirection:'row'
          ,paddingVertical:10, paddingHorizontal:10,}} underlayColor="#F1F2F6"  
            onPress={()=>token ? handleReport(data[0].id) : navigation.navigate('Login')}
            >
              <>
              <Icon name="report" size={20} color="rgba(30,49,157,0.7)" style={{}}/>
              <Text style={{ paddingHorizontal:5,  color:'rgba(30,49,157,0.7)', }}>
                Flag as Inappropriate
              </Text>
              </>
            </TouchableHighlight>
            }

          {//role em buttons close and delete btn
            role === 'em' &&
             <>
              <TouchableHighlight style={{ backgroundColor:'#fff', borderColor:"rgba(0,0,0,1)",
              borderWidth:0.25, flex:1, borderRadius:25}} 
              underlayColor="rgba(0,0,0,0.1)"
              onPress={()=>handlePostStatus(data[0].status)}
              >
                <Text style={{ paddingVertical:10,  textAlign:"center", 
                color: 'rgba(0,0,0,0.7)' }}>
                {data[0].status == 'c' && 'Re-open'}
                {data[0].status == 'o' && 'Close'}
                </Text>
              </TouchableHighlight>
              <TouchableHighlight style={{ backgroundColor:'#fff', borderColor:'rgba(255,0,0,.7)',
              borderWidth:0.25, flex:1, borderRadius:25, marginLeft:10}} 
              underlayColor='rgba(255,0,0,.1)'  
              onPress={()=>Option(data[0].postby)}
              >
                <Text style={{ paddingVertical:10,  textAlign:"center", 
                color:'rgba(255,0,0,.7)' }}>
                Delete
                </Text>
              </TouchableHighlight>
             </>
          } 
          
        </View>   

          </>
        )}

      {/* menu bar */}
      {
        role !== 'js' && role === 'em' &&
        (
          <>
            <View style={{backgroundColor:"#fff", borderTopWidth:.5, borderColor:"lightgrey"}}>
            <Text style={{fontSize:18, letterSpacing:1, padding:10}}>Applicants</Text>
            </View>

            <View style={{backgroundColor:"lightgrey", display:"flex", flexDirection:"row", padding:10}}>
            
            <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'p' ? '#fff' : 'lightgrey',
            }]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("p")}>
              <Text style={styles.btnText}>
              Pending
              </Text>
            </TouchableHighlight>
            <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'a' ? '#fff' : 'lightgrey',
            }]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("a")}>
              <Text style={styles.btnText}>
              Selected
              </Text>
            </TouchableHighlight>
            
            </View>
            <Text style={{color:"grey", paddingHorizontal:10, fontSize:12}}>*Applicant will not be notified when you select an applicant.</Text>
          </>
        )
      }
       
      </>
    );
  };

  // user apply list
  const renderUserItem = ({ item }) => {
  
      return (
        <TouchableHighlight style={styles.itemContainer}  underlayColor="#F1F2F6" 
        onPress={()=>navigation.navigate('ViewProfile', { userid: item.id })}>
        <View style={{padding:10}}>

        <View style={{ display: "flex", flexDirection: "row", flex: 1, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.imageurl.length > 0 ? (
              <Image source={{ uri: `${config.API_URL}/${item.imageurl}` }} style={{ width: 40, height: 40, borderRadius: 5 }} />
            ) : (
              <Image source={require("../../assets/images/default.png")} style={{ width: 40, height: 40, borderRadius: 5 }} />
            )}

            <Text style={{ paddingLeft:5, fontWeight: "500", fontSize: 14, textAlignVertical: 'center', maxWidth: SCREEN_WIDTH - 120 }}
              numberOfLines={1} ellipsizeMode='tail'>
              {capitalizeWords(item.name)}
            </Text>
          </View>

          <TouchableHighlight
            style={[styles.btn2]}
            underlayColor="#F1F2F6"
            onPress={() => handleUserSelect(item.id)}
          >
            <Text style={[styles.btnText, { color: 'rgba(30,49,157,0.7)' }]}>
              {selectedOption === 'p' && 'Select'}
              {selectedOption === 'a' && 'De-select'}
            </Text>
          </TouchableHighlight>
        </View>
        
      </View>
        </TouchableHighlight>
      );
    };

  return (
    <>   
      <View style={{backgroundColor:"#fff", flex:1,
    }}>
      <FlatList
      showsVerticalScrollIndicator={false}
        ref={flatListRef}
        data={usersData} // Pass the usersData as the data for the FlatList
        ListHeaderComponent={PostDetailsInfo}
        renderItem={renderUserItem} // Use the renderUserItem function to render each item
        ListEmptyComponent={()=>{
          return(
            <>
              {
                role === 'em' &&
                <Text style={{textAlign:"center", marginVertical:30, color:"grey"}}>No applicants</Text>
              }
            </>
          )
        }}
        keyExtractor={(item) => item.id} // Provide a unique key for each item
        maxToRenderPerBatch={4}
        onScroll={handleScroll} // Add onScroll event to track the scroll position
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        />

        {/* bottom buttons --- view profile message and apply btn*/}
        {role !== 'em' &&
        <View style={{ width:'100%', borderColor:'rgba(30,49,157,0.7)', borderWidth:0.25,
        display:"flex", flexDirection:"row", padding:10, paddingVertical:15,
        justifyContent: role !== 'em' ? "space-around": "flex-end"}}>
            <TouchableHighlight style={{ borderColor:'grey',borderWidth:0.25, flex:.9, borderRadius:25, backgroundColor:'#1E319D'}} underlayColor="#1E319D"  
            onPress={()=>{postStatus === 'o' && handleApply(id)}}>
              <Text style={{ paddingVertical:10, textAlign:"center", color:'#fff', }}>
              {isApply ? 'Applied': 'Apply Now'}
              </Text>
            </TouchableHighlight>
            <TouchableHighlight style={{color:"grey", borderColor:'rgba(30,49,157,0.3)', borderWidth:2, borderRadius:25,}} 
            onPress={()=>{token ? handlePostSave(data[0].id) : navigation.navigate('Login')}} 
            // underlayColor='rgba(49, 105, 210, 0.5)'
            underlayColor="#F1F2F6">
            <Icon name="bookmark-outline" size={20} color="rgba(30,49,157,0.7)" style={{padding:10}}/>
            </TouchableHighlight>
        </View> 
        }

      </View>
    </>
  );
};

const styles = StyleSheet.create({
    btn:{ 
    borderRadius:5, 
    flex:.5,
    marginHorizontal:2.5,
    },
    btn2:{ 
    borderColor:'rgba(30,49,157,0.7)',
    borderWidth:0.25, 
    borderRadius:5, 
    // marginHorizontal:5,
    paddingHorizontal:10,
    },
    btnText:{
    paddingVertical:10,  
    textAlign:"center", 
    color: "#000"
    },
    itemContainer: {
    backgroundColor: '#fff',
    marginVertical:10,
    marginHorizontal:10,
    borderRadius: 5,
    borderWidth:.25,
    borderColor:"grey"
  },
  container: {
    // marginTop: 10,
    padding:5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor:"#fff",
    borderColor:"lightgrey",
    borderBottomWidth:.25
  },
  headerCell: {
    // fontWeight: 'bold',
    fontSize: 14,
    flex: .5,
    textAlign: 'left',
    color:'#404040',
    textAlignVertical:"center",
    padding:10,
    paddingLeft:0
  },
  cell: {
    flex: .5,
    textAlign: 'left',
    paddingVertical:10,
    color:'#404040'
  },
})