import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import axios from "axios";
import config from "../config";
import { capitalizeWords } from "../fn";

export default UserInfo = ({userid, navigation}) => {

    const [userInfo, setUserInfo] = useState('');

    useEffect(() => {
      fetchUserInfo();
  
      return () => {
        setUserInfo('')
      }
  
    }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/get_user_info/${userid}`);
      setUserInfo(response.data);
    console.log(response.data,'response');

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{margin:10, marginBottom:5}}>
      {userInfo ? (
        <View style={{ backgroundColor:'#fff', padding:10, borderTopLeftRadius:15,borderTopRightRadius:15, borderBottomLeftRadius:0,
        borderBottomRightRadius:0, borderColor:'lightgrey', borderWidth:0.5}}>

            <View style={{display:'flex', flexDirection:"row", justifyContent:"center",}} >
          {/* profile image */}
          <View style={{width:"100%", height:120, backgroundColor:"lightblue", position:"absolute",
           borderTopLeftRadius:15, borderTopRightRadius:15}}/>

          <View style={{width:120, height:120, backgroundColor:"blue", borderRadius:60, borderColor:"#fff", borderWidth:2, marginTop:60}}/>

      {/* <Button title="Message" onPress={() => navigation.navigate('ChatRoom', {touserid: userid, title: capitalizeWords(userInfo[0].name) })} /> */}
        </View>
        <View style={{flexDirection:"column",}}>
                <Text style={{textAlign:"center", fontSize:20, marginLeft:15}}>{capitalizeWords(userInfo[0].name)}hhsd sdhsdh</Text>
                <Text style={{textAlign:"center", fontSize:14, marginLeft:15, color:"grey"}}>asdasdasd{userInfo[0].email}</Text>
            </View>
            <Text style={{textAlignVertical:"center", fontSize:14, color:"grey", padding:5, marginTop:20}}>
            Recent graduate from GCIT. Bsc. CS
            </Text>
        </View>

      ) : (
        <Text>Loading user information...</Text>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
    buttonContainer2: {
    backgroundColor: "#fff",
    borderBottomWidth:0.5,
    borderBottomColor:"lightgrey",
    padding: 10,
    paddingHorizontal:15,
    width: "100%",
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between"
    },
    buttonText2: {
    fontSize: 16,
    fontWeight: "bold",
    },
})