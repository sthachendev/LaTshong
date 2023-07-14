import React, { useEffect, useState, } from "react";
import { View, Text, TouchableHighlight, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import axios from "axios";
import config from "../config";
import { capitalizeWords, getTimeDifference } from "../fn";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import jwtDecode from "jwt-decode";
import { useSelector } from "react-redux";
import Spinner from "../custom/Spinner";

export default PostDetails = ({ route }) => {
  
  const { id, role } = route.params;//post id

  const [data, setData] = useState('');
  const [usersData, setUserData] = useState('');
  const [postby_userid, setPostbyuserid] = useState('');
  const [postby_username, setPostbyusername] = useState('');

  const [loading, setLoading] = useState(false);

  const token = useSelector((state)=>state.token);

  const navigation = useNavigation();

  useEffect(() => {
    console.log('userid',id);
    if(id)
      getJobPost();

    return () => {
      setData('');
      setUserData('');
     };
     
  }, []);

const getJobPost = async () => {
  try {//post id
    setLoading(true);
    const res = await axios.get(`${config.API_URL}/api/get_job_post/${id}`);
    setData(res.data);
    setPostbyuserid(res.data[0].postby);
    // console.log(res.data[0].postby);
    setPostbyusername(res.data[0].name);
    const applicants = res.data[0].applicants;
    console.log('applicants',applicants.length)

    setLoading(false);

    if ( role === 'em' && role !== 'js' && applicants.length > 0){
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/get_user_info`, {
        params: {
          userArray: applicants
        }
      });
      // console.log(response.data,'response');
      setUserData(response.data);
      setLoading(false);
    }

  } catch (error) {
    console.error(error);
  }
};

const handleApply = async(postid) => {
  try {
    if (token) {
      const res = await axios.put(`${config.API_URL}/api/update_job_post`, {
        userid: jwtDecode(token).userid, 
        postid:postid
      });
      // console.log(res.data);
      console.log('update_job_post');
      console.log(res.data);
    }else{
      navigation.navigate('Login');
    }
    
  } catch (error) {
    console.error(error)
  }
}

const handleMessage = () => {
  if (token) {
    navigation.navigate('ChatRoom', 
    {touserid: postby_userid, title: capitalizeWords(postby_username)})
  }else{
    navigation.navigate('Login');
  }
}
  
  const [selectedOption, setSelectedOption] = useState("all");

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if(option === 'all'){
        console.log(option);
    }else if(option === 'p'){
        console.log(option);
    }else if(option === 'a'){
        console.log(option);
    }else if(option === 'r'){
        console.log(option);
    }
  }

  if (loading) {
    return <Spinner />;
  }
  
  {/* Display the fetched post data  and menu bar */}
  const PostDetailsInfo = () => {
    return (
      <>
      {/* post detail container */}
        <View style={{padding:10, backgroundColor:"#fff",  borderColor:'lightgrey',
        borderWidth:0.5, marginHorizontal:5, marginTop:15, marginBottom:0, borderRadius:5}}>
        {data && (
          <>
          <View style={{display:"flex", flexDirection:"row",}}>
        {data[0].imageurl !== null ? 
        <Image source={{ uri: `${data[0].imageurl}` }} style={{width:40, height:40, borderRadius:15}} />
        :
        <View style={{width:40, height:40, backgroundColor:"#000", borderRadius:20}}/>
        }

        <View>
        <Text style={{marginLeft:5, fontWeight:"bold", fontSize:14}}>{capitalizeWords(data[0].name)}</Text>
        <Text style={{color:"grey", marginLeft:5, fontSize:12}}>{data[0].email}</Text>
        </View>

        <Text style={{color:"grey",position:"absolute", top:0, right:0}}>{getTimeDifference(data[0].postdate)}</Text>
      </View>
 
      <View style={styles.container}>

        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Job Title</Text>
          <Text style={styles.cell}>{capitalizeWords(data[0].job_title)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Description</Text>
          <Text style={styles.cell}>{data[0].job_description}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Requirements</Text>
          <Text style={styles.cell}>{data[0].job_requirements}</Text>
        </View> 
        
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>vacancy_no</Text>
          <Text style={styles.cell}>{data[0].vacancy_no}</Text>
        </View> 
        
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>nature</Text>
          <Text style={styles.cell}>{data[0].nature}</Text>
        </View> 
        
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>location_</Text>
          <Text style={styles.cell}>{data[0].location_}</Text>
        </View> 
        
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Salary</Text>
          <Text style={styles.cell}>{data[0].job_salary}</Text>
        </View>

        <View style={[styles.tableRow,{borderBottomWidth:0}]}>
          <Text style={styles.headerCell}>Remarks</Text>
          <Text style={styles.cell}>{data[0]?.remarks === "" ? "-" : data[0].remarks}</Text>
        </View>

      </View>    
          </>
        )}
        </View>

        {/* bottom buttons */}
        <View style={{ width:'100%', marginVertical:10,
        display:"flex", flexDirection:"row", padding:10, 
        justifyContent: role !== 'em' ? "space-around": "flex-end"}}>
          {role !== 'em' &&
            <>
            <TouchableHighlight style={{ backgroundColor:'#fff', borderColor:'grey',borderWidth:0.25, flex:.3, borderRadius:25 }} underlayColor="#F1F2F6"  
            onPress={()=>navigation.navigate('Profile', { userid: postby_userid })}
            >
              <Text style={{ paddingVertical:10,  textAlign:"center", color:'grey' }}>
                View Profile
              </Text>
            </TouchableHighlight>
        
            <TouchableHighlight style={{borderColor:'grey',borderWidth:0.25, flex:.3, borderRadius:25}} underlayColor="#F1F2F6"  
            onPress={handleMessage}
            >
              <Text style={{ paddingVertical:10,  textAlign:"center", color:'grey' }}>
                {/* <MaterialIcons name="mail" size={20} color="lightgrey" /> */}
                Message
              </Text>
            </TouchableHighlight>

            <TouchableHighlight style={{ borderColor:'grey',borderWidth:0.25, flex:.3, borderRadius:25, backgroundColor:'#1E319D'}} underlayColor="#1E319D"  
            onPress={()=>handleApply(id)}>
              <Text style={{ paddingVertical:10,  textAlign:"center", color:'#fff' }}>
              Apply
              </Text>
            </TouchableHighlight>
            </>
            }

          {
            role === 'em' &&
            <TouchableHighlight style={{ backgroundColor:'#fff', borderColor:'red',
            borderWidth:0.25, flex:1, borderRadius:25}} 
            underlayColor="rgba(255,0,0,.1)"  
            onPress={() => navigation.navigate('PostDetails', { id: item.id })}
            >
              <Text style={{ paddingVertical:10,  textAlign:"center", color:'rgba(255,0,0,.7)' }}>
              Close
              </Text>
            </TouchableHighlight>
          } 
        </View>

        {/* menu bar */}
        {
          role !== 'js' && role === 'em' &&
          (
            <>
              <View style={{backgroundColor:"#fff", borderTopWidth:.5, borderColor:"lightgrey"}}>
              <Text style={{fontSize:18, letterSpacing:1, padding:10}}>Applicants</Text>
              </View>

              <View style={{backgroundColor:"lightgrey", display:"flex", flexDirection:"row", padding:10}}>
              <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'all' ? '#fff' : 'lightgrey',
              elevation: selectedOption === 'all' ? 2: 0}]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("all")}>
                <Text style={styles.btnText}>
                All
                </Text>
              </TouchableHighlight>
              
              <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'p' ? '#fff' : 'lightgrey',
                elevation: selectedOption === 'p' ? 2 : 0 }]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("p")}>
                <Text style={styles.btnText}>
                Pending
                </Text>
              </TouchableHighlight>
              <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'a' ? '#fff' : 'lightgrey',
                elevation: selectedOption === 'a' ? 2 : 0 }]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("a")}>
                <Text style={styles.btnText}>
                Accept
                </Text>
              </TouchableHighlight>
              <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'r' ? '#fff' : 'lightgrey',
                elevation: selectedOption === 'r' ? 2 : 0 }]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("r")}>
                <Text style={styles.btnText}>
                Decline
                </Text>
              </TouchableHighlight>
              </View>
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
        onPress={()=>navigation.navigate('Profile', { userid: item.id })}>
          <View style={{padding:10}}>
        <View style={{display:"flex", flexDirection:"row", flex:1}}>

          {item.imageurl !== null ? 
          <Image source={{ uri: `${item.imageurl}` }} style={{width:40, height:40, borderRadius:15}} />
          :
          <View style={{width:40, height:40, backgroundColor:"#000", borderRadius:20}}/>
          }
          <View>
          <Text style={{marginLeft:5, fontWeight:"bold", fontSize:14}}>{capitalizeWords(item.name)}</Text>
          <Text style={{color:"grey", marginLeft:5, fontSize:12}}>{item.email}</Text>
          </View>

          <TouchableHighlight style={[styles.btn2, {position:"absolute", top:0, right:0}]} 
          underlayColor="#F1F2F6" 
          onPress={() => handleOptionSelect("all")}>
          <Text style={[styles.btnText, { color:'grey' }]}>
          Accept
          </Text>
        </TouchableHighlight>
        </View>
        
      </View>
        </TouchableHighlight>
      );
    };

  return (
    <>   
  {/* user applied list */}
      <View style={{backgroundColor:"#fff", 
    // borderTopWidth:.5, borderColor:"lightgrey"
    }}>
      <FlatList
        data={usersData} // Pass the usersData as the data for the FlatList
        ListHeaderComponent={PostDetailsInfo}
        ListFooterComponent={()=>{return(<View style={{margin:10}}></View>)}}
        renderItem={renderUserItem} // Use the renderUserItem function to render each item
        ListEmptyComponent={()=>{
          return(
            <Text style={{textAlign:"center", marginVertical:30, color:"grey"}}>No applicants</Text>
          )
        }}
        keyExtractor={(item) => item.id} // Provide a unique key for each item
        maxToRenderPerBatch={4}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
    btn:{ 
    // borderColor:'#000',
    // borderWidth:0.25, 
    borderRadius:20, 
    flex:.25,
    marginHorizontal:2.5,
    },
    btn2:{ 
    borderColor:'#3a348e',
    borderWidth:0.25, 
    borderRadius:25, 
    marginHorizontal:5,
    paddingHorizontal:20
    },
    btnText:{
    paddingVertical:10,  
    textAlign:"center", 
    color: "#000"
    },
    itemContainer: {
    backgroundColor: '#fff',
    marginVertical:20,
    marginHorizontal:10,
    borderRadius: 5,
    marginBottom:0,
    // elevation: 2, 
    borderWidth:.25,
    borderColor:"grey"
  },
  container: {
    marginTop: 16,
    padding:5,
    // backgroundColor: 'red',
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
    fontWeight: 'bold',
    fontSize: 14,
    flex: .7,
    textAlign: 'left',
    color:'grey',
    textAlignVertical:"center",
    padding:10
  },
  cell: {
    flex: 1,
    textAlign: 'left',
    paddingVertical:10,
    color:'#404040'
  },
})