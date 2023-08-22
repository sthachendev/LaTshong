import axios from "axios";
import { View, Text, StyleSheet, TouchableHighlight, ToastAndroid, TouchableOpacity } from "react-native";
import config from "../config";

export default function Setting({ navigation, route }) {

  const { userid } = route.params;

  const handleRequest = () => {
    axios.patch(`${config.API_URL}/api/user/${userid}/apply/verify`)
    .then( (res) => {
    ToastAndroid.show(`${res.data.message}`, ToastAndroid.SHORT);
    })
    .catch(e=>{
      console.log(e)
    })
  }

  return (
    <View style={{flex:1, backgroundColor:"#fff", padding:10, paddingLeft:25}}>

      <Text style={{color:'#404040'}}>Account Setting</Text>

      <TouchableOpacity onPress={()=>navigation.navigate('ChangeName', userid)} style={{marginTop:20}} activeOpacity={0.6}>
        <Text style={{fontSize:16}}>Change Name</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={()=>navigation.navigate('ChangePassword', userid)} style={{marginTop:20}} activeOpacity={0.6}>
        <Text style={{fontSize:16}}>Change Password</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={()=>handleRequest()} style={{marginTop:25}} activeOpacity={0.6}>
        <Text style={{fontSize:16}}>Request Account Verification</Text>
      </TouchableOpacity>

      <View style={{borderTopWidth:0.5, borderTopColor:'lightgrey', marginTop:25}}/>

      <Text style={{color:'#404040', marginTop:15}}>Help & Support</Text>

      <TouchableOpacity onPress={()=>navigation.navigate('Support')} style={{marginTop:25}} activeOpacity={0.6}>
        <Text style={{fontSize:16}}>Contact Us</Text>
      </TouchableOpacity>

      <View style={{borderTopWidth:0.5, borderTopColor:'lightgrey', marginTop:25}}/>

      <Text style={{color:'#404040', marginTop:15}}>Legal</Text>

      <TouchableOpacity onPress={()=>navigation.navigate('Policy')} style={{marginTop:25}} activeOpacity={0.6}>
        <Text style={{fontSize:16}}>Terms of Use & Privacy Policy</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
    button: {
      width: '100%',
      backgroundColor: '#1E319D',
      paddingVertical: 13,
      paddingHorizontal: 20,
      borderRadius: 50,
      marginTop:50,
      alignItems:'center',
      elevation:2
    },
    buttonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight:'bold'
    },
  });
