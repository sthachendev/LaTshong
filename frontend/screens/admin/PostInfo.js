import { Text, View, Modal, TouchableWithoutFeedback, TouchableHighlight, Image, StyleSheet,
  ToastAndroid, TouchableOpacity, Alert} from "react-native";
import axios from "axios";
import config from "../config";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { capitalizeWords, getTimeDifference2, getTimeDifference, capitalizeFirstLetterOfParagraphs } from "../fn";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import ImageViewer from "../custom/ImageViewer";
import Ionicons from "react-native-vector-icons/Ionicons";

export default PostInfo = ({isModalVisible, setIsModalVisible, post, setPost, fetchData}) => {//current user role
  
  const token = useSelector(state=>state.token);

  const [data, setData] = useState('');

  const getJobPost = async () => {
    try {//post id
      const id = post.id
      if(post.posttype === 'job_post') {
        const res = await axios.get(`${config.API_URL}/api/post-jobs/${id}`);//no need to add token
        console.log(res.data);
        setData(res.data);
      }else if (post.posttype === 'feed_post') {
        const res = await axios.get(`${config.API_URL}/api/post-feeds/${id}`);//no need to add token
        console.log(res.data);
        setData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
      getJobPost();

    return () => {
      setData('');
     };
     
  }, [post]);

  const handleDelete = (postid) => {
    Alert.alert(
      "Do you want to delete the post?",
      "Post will be permanently deleted.",
      [
          {
              text: 'Delete',
              onPress: () => {
                deletePost(postid);
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
  
  const deletePost = async (postid) => {
        console.log(post.posttype);

        if (post.posttype === 'feed_post') {
          try {
          const res = await axios.delete(`${config.API_URL}/api/post-feeds/${postid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            }
          });
        
            console.log(res.status)
            if (res.status === 200) {
              fetchData();
              setIsModalVisible(false);
              setPost('');
              ToastAndroid.show("Post Deleted", ToastAndroid.SHORT);
            }
          } catch (error) {
          console.log(error);
          }
        }else if (post.posttype === 'job_post') {
          try {
            const id = postid;
            const res = await axios.delete(`${config.API_URL}/api/post-jobs/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              }
            });
          
            console.log(res.status)
            if (res.status === 200) {
              fetchData();
              setIsModalVisible(false);
              setPost('');
              ToastAndroid.show("Post Deleted", ToastAndroid.SHORT);
            }
            } catch (error) {
            console.log(error);
            }
        }
     
  };

  const [modalVisible, setModalVisible] = useState(false);//image viewer

  return (
      <>
      <Modal visible={isModalVisible} onRequestClose={()=>setIsModalVisible(false)} transparent={true} animationType="slide">
      <TouchableWithoutFeedback onPress={()=>setIsModalVisible(false)}>
          <View style={{
              backgroundColor: "rgba(0,0,0,0.9)",
              height: "100%", 
              elevation:2
          }}>
          
      <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>

          <View style={{
              backgroundColor: "#fff",
              padding: 15,
              paddingTop:0,
              position: "absolute", // Position the modal at the bottom
              bottom: 0, // Align the modal to the bottom of the screen
              left: 0,
              right: 0,
              height:'100%', // Set the height of the modal (half of the screen)
          }}>
          {/* top close header and next/ post btn */}
          <View style={styles.buttonContainer2}>
              <View/>
              <Text style={styles.buttonText2}> {post.posttype == 'job_post' && 'Job Post'}
            {post.posttype == 'feed_post' && 'Feed Post'} Information </Text>
              <TouchableOpacity onPress={()=>{setIsModalVisible(false);fetchData();setPost('')}}>
              <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>
          </View>

          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          
          {post.posttype === 'feed_post' && data && 
          <>
            <View style={{backgroundColor: '#fff'}} >

            <ImageViewer uri={`${config.API_URL}/${data[0].media_uri}`} modalVisible={modalVisible} setModalVisible={setModalVisible}/>

            <View style={{ paddingVertical:10}}>
              <View style={{display:"flex", flexDirection:'row', paddingTop:10, paddingHorizontal:15}}>
              {data[0].imageurl.length > 0 ? 
                <Image source={{ uri: `${config.API_URL}/${data[0].imageurl}` }} style={{width:40, height:40, borderRadius:25, borderColor:"lightgrey", borderWidth:1,}} />
                :
                <Image source={require("../../assets/images/default.png")} 
                style={{width:40, height:40, borderRadius:20,  borderColor:"lightgrey", borderWidth:1, marginLeft:5}}
                />
              }
                <View style={{flex:1}}>

                <View style={{ display:'flex', flexDirection:'row', justifyContent:'space-between', flex:1}}>

                  <TouchableOpacity activeOpacity={0.9}
                    onPress={()=>{role ? navigation.navigate('ViewProfile', { userid: data[0].postby}) : navigation.navigate('Login')}}>
                  <Text style={{marginLeft:10, textAlignVertical:'center', fontWeight:'500', marginRight:20,
                  color: "#404040", fontSize:14}} numberOfLines={1}>{capitalizeWords(data[0].name)}</Text>
                  </TouchableOpacity>

                </View>

                  <Text style={{color:"grey", fontSize:12, textAlignVertical:'center', marginLeft:10}}>{getTimeDifference2(data[0].postdate)}</Text>
                </View>

              </View>
            {
              data[0]._desc && data[0]._desc.trim() !== '' ?
              <Text style={{  color: "#404040", textAlign:'justify', marginVertical:10, paddingHorizontal:15 }}>
              {capitalizeFirstLetterOfParagraphs(data[0]._desc)}
            </Text>
            :
            <View style={{marginTop: 10}}/>
            }

              {data[0].media_type === 'i' &&
              <>
              <TouchableOpacity onPress={()=>setModalVisible(true)} activeOpacity={1}>
                <Image
                  source={{ uri: `${config.API_URL}/${data[0].media_uri}` }}
                  style={{ width: '100%', height: 250, borderColor:"lightgrey", borderWidth:1  }}
                  resizeMode="cover" // This ensures the image fills the container without distorting its aspect ratio
                />    
                <Ionicons
                    name="expand-outline"
                    color='lightgrey'
                    size={20}
                    style={{ position: "absolute", bottom: 15, right: 15 }}
                  />
              </TouchableOpacity>
              </>}
              
              {data[0].media_type === 'v' &&
              <>
                  {/* <VideoPlayer  videoUri={`${config.API_URL}/${data[0].media_uri}`} /> */}
                  <Video
                      source={{ uri: `${config.API_URL}/${data[0].media_uri}` }}
                      style={{ width: "100%", height: 200, borderRadius:5, backgroundColor:'#000' }}
                      useNativeControls
                      resizeMode="contain"
                    />
              </>}
            </View>

          </View>
          </>}
          {post.posttype === 'job_post' && <>
          {data && (
      <>
        <View style={{padding:10, backgroundColor:"#fff",  borderColor:'lightgrey',
        borderWidth:0.5, marginHorizontal:5, marginTop:15, marginBottom:0, borderRadius:5}}>

        <View style={{display:'flex', flexDirection:'row', justifyContent:'flex-end', marginBottom:5}}>
          <Text style={{color:"grey", fontSize:12, textAlignVertical:'center', marginLeft:5}}>
            {data[0]?.status == 'o' && 'Open ~ '}{data[0]?.status == 'o' && getTimeDifference(data[0]?.postdate)}
            {data[0]?.status == 'c' && 'Closed ~ '}{data[0]?.status == 'c' && getTimeDifference(data[0]?.closedate)}</Text>
            
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
        <View style={{flexDirection:'row'}}>
          <Text style={{marginLeft:10, fontWeight:"bold", fontSize:14}}>{capitalizeWords(data[0].name)}</Text>
        {data[0].verification_status == 'verified' &&
              <Text style={{marginLeft:5, color:"grey", fontSize:12, textAlignVertical:'center'}}>
            <MaterialIcons name="verified" color='blue' size={16}/></Text>}
          </View>
        <Text style={{marginLeft:10, color:"grey", fontSize:12}}>{data[0].email}</Text>
        </View>

      </View>
      
      {/* job details */}
      <View style={styles.container}>

        <Text style={{padding:10, fontWeight:'bold'}}>{capitalizeWords(data[0].job_title)}</Text>
        <Text style={{padding:10, paddingTop:0, color:'#404040', textAlign:'justify'}}>{capitalizeFirstLetterOfParagraphs(data[0].job_description)}</Text>

        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Requirements</Text>
          <Text style={styles.cell}>{capitalizeFirstLetterOfParagraphs(data[0].job_requirements)}</Text>
        </View> 
        
        <View style={styles.tableRow}>
          <Text style={styles.headerCell}>Total Slots</Text>
          <Text style={styles.cell}>{data[0].vacancy_no}</Text>
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

        <View style={[styles.tableRow,{borderBottomWidth:0}]}>
          <Text style={styles.headerCell}>Remarks</Text>
          <Text style={styles.cell}>{data[0]?.remarks === "" ? "-" : capitalizeFirstLetterOfParagraphs(data[0].remarks)}</Text>
        </View>

      </View>

     <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
     <Text style={{fontSize:12, color:'#404040', paddingLeft:10}}>Total Applicant: {data[0].applicants.length}</Text>
     </View>
      </View>

          </>
        )}
          </>}

          </ScrollView>

          <TouchableHighlight style={{ backgroundColor:'#fff', borderColor:'rgba(255,0,0,.7)',
          width:'100%', borderWidth:0.25, borderRadius:25}} 
            underlayColor='rgba(255,0,0,.1)'  
            onPress={()=>handleDelete(post.id)}
            >
              <Text style={{ paddingVertical:10,  textAlign:"center", 
              color:'rgba(255,0,0,.7)' }}>
              Delete Post
              </Text>
            </TouchableHighlight>

      </View>

          </TouchableWithoutFeedback>

          </View>
          </TouchableWithoutFeedback>

      </Modal>
      </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonContainer2: {
    backgroundColor: "#F1F2F6",
    padding: 10,
    paddingHorizontal:15,
    width: "100%",
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",
    borderRadius:10
  },
  button: {
    width: '100%',
    backgroundColor: '#1E319D',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop:30,
    alignItems:'center',
    elevation:2
  },
  buttonText3: {
    color: "#fff",
    fontSize: 14,
    fontWeight:'bold'
  },
  buttonText2: {
    fontSize: 16,
    fontWeight:'bold'
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  inputDesc: {
    backgroundColor: "#F1F2F6",
    width: "100%",
    height: 150,
    maxHeight:300,
    paddingLeft: 10,
    paddingTop: 10,
    borderColor: "grey",
    borderRadius: 5,
    justifyContent: "flex-start",
    color: "black",
    textAlignVertical: "top",
    marginTop:30
    // elevation:2
  },
  mediaBtn:{
    backgroundColor:"#fff",
    padding:10, paddingHorizontal:15,
    marginTop:30, 
    borderWidth:0.5, borderColor:"grey", 
    flex:1,
    flexDirection:'row',
    justifyContent:'center'
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
    padding:10
  },
  cell: {
    flex: .5,
    textAlign: 'left',
    paddingVertical:10,
    color:'#404040'
  },
});
