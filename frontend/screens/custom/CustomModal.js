import { Text, View, Modal, TouchableWithoutFeedback, TouchableHighlight, Image, StyleSheet} from "react-native";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import { capitalizeWords, getTimeDifference } from "../fn";

//used to show the result on press on particular location
export default ShowSelectedLocationJobDetails = ({isModalVisible, closeModal, selectedMarkerData, navigation }) => {
    
    const role = useSelector(state => state.token);
    console.log(selectedMarkerData.id,'selectedMarkerData');
    const postid = selectedMarkerData.id;

    const [data, setData] = useState('');

    const getpost = () => {
      if (postid) axios.get(`${config.API_URL}/api/get_job_post/${postid}`)//no need to add token
      .then(res=>{
        console.log(res.data);
        setData(res.data);
      })
      .catch(e=>console.log(e))
    }

    useEffect(()=>{
      getpost();
    },[selectedMarkerData])

    return (
      <>
      {/* <Text>selectedMarkerData{selectedMarkerData}</Text> */}
      {selectedMarkerData && (
        <Modal visible={isModalVisible} onRequestClose={closeModal} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={{
              backgroundColor: "transparent",
              height: "100%", // Set the height of the modal (half of the screen)
              // You can adjust the height to your desired value
              elevation:2
          }}>
            
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>

          <View style={{
            backgroundColor: "#fff",
            padding: 16,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 29,
            position: "absolute", // Position the modal at the bottom
            bottom: 0, // Align the modal to the bottom of the screen
            left: 0,
            right: 0,
            height: "40%", // Set the height of the modal (half of the screen)
            // You can adjust the height to your desired value
          }}>
            
          {data && (
          <>
          <View style={{display:"flex", flexDirection:"row", paddingTop:20}}>

            {data[0].imageurl !== null ? 
            <Image source={{ uri: `${config.API_URL}/${data[0].imageurl}` }} style={{width:40, height:40, borderRadius:25}} />
            :
            <View style={{width:40, height:40, backgroundColor:"#000", borderRadius:20}}/>
            }

            {/* <View > */}
            <Text style={{marginLeft:10, fontWeight:"bold", fontSize:14, textAlignVertical:'center'}}>{capitalizeWords(data[0].name)}</Text>
            {/* <Text style={{marginLeft:10, color:"grey", fontSize:12, textAlignVertical:'center'}}>~Verified Employer</Text> */}
            {/* </View> */}

          </View>

          <Text style={{color:"grey",position:"absolute", top:20, right:20, fontSize:12}}>
            {data[0].status == 'o' && 'Open ~ '}{data[0].status == 'o' && getTimeDifference(data[0].postdate)}
            {data[0].status == 'c' && 'Closed ~ '}{data[0].status == 'c' && getTimeDifference(data[0].closedate)}</Text>

            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Job Title</Text>
              <Text style={styles.cell}>{capitalizeWords(data[0].job_title)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Description</Text>
              <Text style={styles.cell} numberOfLines={7}>{data[0].job_description}</Text>
            </View>

              </>
            )}

          {/* pass post id */}
          <View style={{ backgroundColor:'#fff', borderColor:"rgba(0,0,0,1)",
              borderWidth:0.25, borderRadius:25, position:"absolute", bottom:10, width:'100%', alignSelf:'center', padding:1}} >
          <TouchableHighlight 
              underlayColor="rgba(0,0,0,0.1)"
              onPress={() => navigation.navigate('PostDetails', { id: postid, role })}>
                <Text style={{ paddingVertical:10,  textAlign:"center", 
                color: 'rgba(0,0,0,0.7)' }}>
                  View Details
                </Text>
              </TouchableHighlight>
          </View>
          
          </View>

          </TouchableWithoutFeedback>

          </View>
          </TouchableWithoutFeedback>

        </Modal>
      )}
      </>
    )
}

const styles = StyleSheet.create({
tableRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  // marginBottom: 8,
  backgroundColor:"#fff",
  // borderColor:"lightgrey",
  // borderBottomWidth:.25,
  paddingTop:20
},
headerCell: {
  fontWeight: 'bold',
  fontSize: 14,
  flex: .7,
  textAlign: 'left',
  color:'grey',
  textAlignVertical:"center",
},
cell: {
  flex: 1,
  textAlign: 'left',
  // paddingVertical:10,
  color:'#404040'
},
})