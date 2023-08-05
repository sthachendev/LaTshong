import { Text, View, Modal, TouchableWithoutFeedback, TouchableHighlight, Image, StyleSheet,
    ToastAndroid, TouchableOpacity, TextInput} from "react-native";
import axios from "axios";
import config from "../config";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import jwtDecode from "jwt-decode";

export default FeedPostsOption = ({isModalVisible, setIsModalVisible, postby, postid, getFeedPost}) => {
    
    const token = useSelector(state=>state.token);
    const userid = token ? jwtDecode(token).userid : null;
    
    const handleReport = async () => {
        try {
        const res = await axios.post(`${config.API_URL}/api/add_reportedby_feed_post/${postid}/${userid}`,{}, {
        headers: {
            Authorization: `Bearer ${token}`,
            }
        });
        console.log(res.status)
        if (res.status === 200){
            ToastAndroid.show("Reported", ToastAndroid.SHORT);
            setIsModalVisible(false);
        }       
        } catch (error) {
        console.log(error.response.data);
        }
    };

    const handleDelete = () => {
        axios.delete(`${config.API_URL}/api/delete_feed_post/${postid}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                }
        }).then(res=>{
            ToastAndroid.show("Deleted", ToastAndroid.SHORT);
            setIsModalVisible(false);
            getFeedPost();
        }).catch(e=>{
            console.log(e.response.data);
        })
    }

    return (
        <>
        <Modal visible={isModalVisible} onRequestClose={()=>setIsModalVisible(false)} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={()=>setIsModalVisible(false)}>
            <View style={{
                backgroundColor: "rgba(0,0,0,0.5)",
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
                height:'30%', // Set the height of the modal (half of the screen)
            }}>
            {/* top close header and next/ post btn */}
            <View style={styles.buttonContainer2}>
                <View/>
                <TouchableOpacity onPress={()=>{setIsModalVisible(false);}}>
                <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>

            </View>

            <View style={styles.container}>

                {
                    postby === userid ?
                    <TouchableHighlight style={styles.btn} underlayColor="#F1F2F6"
                    onPress={handleDelete}>
                    <Text style={{textAlign:'center', textAlignVertical:'center', paddingVertical:20, color:'red'}}>Delete Post</Text>
                    </TouchableHighlight>
                    :
                    <TouchableHighlight style={styles.btn} underlayColor="#F1F2F6"  
                    onPress={handleReport}>
                    <Text style={{textAlign:'center', textAlignVertical:'center', paddingVertical:20, color:'red'}}>Report Post</Text>
                    </TouchableHighlight>
                }

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
        justifyContent:"center",
        alignContent:'center'
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
    btn:{ 
    backgroundColor:'#fff',
    borderColor:'red',
    borderWidth:0.25,
    borderRadius:5,
    marginVertical:15 }
  });
  