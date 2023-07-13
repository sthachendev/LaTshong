import React, { useState } from "react";
import { ToastAndroid,  TouchableOpacity, View, StyleSheet } from "react-native";
import { TextInput ,Text } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TouchableHighlight } from "react-native";
import { ScrollView } from "react-native";
import CountdownTimer from "../custom/CountdownTimer";
import { getOtp } from "../fn";
import config from '../config';
import axios from "axios";

export default function SignupStep2({navigation, route}) {

    const [message, setMessage] = useState("");

    const {email, validOtp, data} = route.params;

    const [otp, setOtp] = useState("");

    const signup = async() => {
        try {
          const response = await axios.post(`${config.API_URL}/api/signup`, data);
          console.log(response.status);
          if (response.status){
            ToastAndroid.show("Account created", ToastAndroid.SHORT);
            navigation.pop(2);
          }
        }catch (error) {
          console.log(error.message);
        }
      }

    const handleSignup = () => {
    setMessage("");
    console.log(otp,'otp');
    console.log(validOtp, 'validOtp');
    if (otp.trim() === ""){
    setMessage('Kindly enter an OTP!')
        console.log('ok')
    }else if ( otp !== validOtp){
        setMessage("OTP doesn't match!")
    }else if (validOtp && validOtp !== "" && otp !== "" && validOtp === otp ){
        console.log('valid otp');
        signup();
    }
    };

    return (
        <ScrollView style={{backgroundColor:'#fff', flex:1}}>
        {/* <Image source={require('../../assets/wave.png')} style={{position:"absolute", width:'90%', height:180}}/> */}

        {/* header */}
            <TouchableHighlight onPress={()=>navigation.goBack()} underlayColor='#fff'
            style={{marginTop:10, padding:10, }}
            >
            <MaterialIcons name="arrow-back" size={24} color="#152370" />
            </TouchableHighlight>

    {/* LaTshong */}
        <Text style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color:"#152370",
            letterSpacing: 4,
            fontSize: 25,
            paddingBottom:10,
        }}>LaTshong</Text>

    {/* main components */}
    <View style={styles.container}>

        <CountdownTimer minutes={15}/>

        <View style={{marginVertical:10, marginBottom: message !== "" ? 0 : 30}}>
        <Text style={{
            // textAlign: 'center',
            color:'grey',
            }}>OTP code sent to {email}, enter before it expires.</Text>
        </View>  

            {message !== "" && message && 
            <>
            <View style={{backgroundColor:'rgba(255, 0, 0, 0.1)', 
            borderRadius:2, padding:10, marginVertical:10}}>
            <Text style={{color:'rgba(255, 0, 0, 0.5)', fontWeight:"300", textAlign:"center"}}>{message}</Text>
            </View>
            </>}

            <TextInput
            mode="outlined"
            label="One Time Password"
            value={otp}
            onChangeText={setOtp}
            onFocus={()=>setMessage("")}
            style={{fontSize:14,}}
            theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
            />

            <View style={{ marginVertical:20, display:'flex', justifyContent:"center"}}>
            <TouchableHighlight style={styles.button} onPress={handleSignup} underlayColor='#1E319D'>
                <Text style={styles.buttonText}>Create account</Text>
            </TouchableHighlight>
            </View>

            <View style={{flexDirection:'row', marginVertical:20, justifyContent:'center'}}>
        <Text style={{fontWeight:'300'}}>Didn't get the OTP?</Text>
        <TouchableOpacity 
        onPress={() => { navigation.navigate('Signup');}}
        style={{
        }}
        >
        <Text style={{marginLeft:5, fontWeight:"700", color:'#1E319D'}} 
        onPress={()=>getOtp(email, setValidOtp)}>Resend</Text>
        </TouchableOpacity>
        </View>

    </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal:40,
    backgroundColor:'#fff',
    borderTopEndRadius:50,
    borderTopStartRadius:50,
  },
  button: {
    width: '100%',
    // width: 270,
    backgroundColor: '#1E319D',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop:20,
    alignItems:'center',
    elevation:2

  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight:'bold'
  },
});
