import { Text, View, Modal, TouchableWithoutFeedback, TouchableHighlight, Image, StyleSheet,
    ToastAndroid, TouchableOpacity, TextInput} from "react-native";
import axios from "axios";
import config from "../config";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import { capitalizeWords, getTimeDifference2 } from "../fn";

export default UserInfo = ({isModalVisible, setIsModalVisible, user, fetchUserData}) => {//current user role
    
    const token = useSelector(state=>state.token);
    
    const handleDelete = async (userid) => {
        try {
        const res = await axios.delete(`${config.API_URL}/api/delete_user/${userid}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            }
        });
       
        console.log(res.status)
        if (res.status == 200){
            fetchUserData();
            setIsModalVisible(false)
            ToastAndroid.show("User Deleted", ToastAndroid.SHORT);
        }
        } catch (error) {
        console.log(error);
        }
    };

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
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                position: "absolute", // Position the modal at the bottom
                bottom: 0, // Align the modal to the bottom of the screen
                left: 0,
                right: 0,
                height:'70%', // Set the height of the modal (half of the screen)
            }}>
            {/* top close header and next/ post btn */}
            <View style={styles.buttonContainer2}>
                <View/>
                <Text style={styles.buttonText2}>User Information</Text>
                <TouchableOpacity onPress={()=>{setIsModalVisible(false);}}>
                <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>

            </View>

            <View style={styles.container}>
            {/* profile image */}
            <View style={{ alignItems:'center', padding:15}}>
            {user.imageurl && user.imageurl.length > 0 ? 
            <Image  source={{ uri : `${config.API_URL}/${user.imageurl}`}}  
            style={{width:100, height:100, borderRadius:50, borderColor:"lightgrey", borderWidth:1,}}
            />
            :
            <Image source={require("../../assets/images/default.png")} 
            style={{width:100, height:100, borderRadius:50, borderColor:"lightgrey", borderWidth:1,}}
            />
            }
            </View>
          
            <Text style={{fontWeight:'bold', padding:10}}>{user.name && capitalizeWords(user.name)}</Text>
            <Text style={{padding:10}}>CID No: {user.cid}</Text>
            <Text style={{padding:10}}>{user.email}</Text>
            <Text style={{padding:10}}>{user.role === 'js' && 'Job Seeker'}{user.role === 'em' && 'Employer'}</Text>
            <Text style={{padding:10}}>Joined - {getTimeDifference2(user.created_on)}</Text>
            <Text style={{padding:10}} numberOfLines={7}>{user.bio ? user.bio : 'No Bio'}</Text>
            
            <TouchableHighlight style={{ backgroundColor:'#fff', borderColor:'rgba(255,0,0,.7)', position:"absolute", bottom:0,
            width:'100%',
              borderWidth:0.25, borderRadius:25, marginLeft:10}} 
              underlayColor='rgba(255,0,0,.1)'  
              onPress={()=>handleDelete(user.id)}
              >
                <Text style={{ paddingVertical:10,  textAlign:"center", 
                color:'rgba(255,0,0,.7)' }}>
                Delete Account
                </Text>
              </TouchableHighlight>
            </View>

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
    }
  });
  