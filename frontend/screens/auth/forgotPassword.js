import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View, StyleSheet, ToastAndroid } from "react-native";
import { TextInput ,Text } from "react-native-paper";
import config from '../config';
import axios from "axios";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TouchableHighlight } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { ScrollView } from "react-native";
import { ActivityIndicator } from "react-native";

export default function ForgotPassword({navigation}) {
  const [email, setEmail] = useState("");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [validOtp, setValidOtp] = useState('');
  const [hide, setHide] = useState(false);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  const [message, setMessage] = useState("");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const isFocused = useIsFocused();

  useEffect(()=>{
    if (isFocused){
      setMessage("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [navigation,isFocused])

  const handleRequestOTP = async() => {
   if(email.trim() !== ""){
    setLoading(true);
    axios.post(`${config.API_URL}/api/otp`, { email })
    .then(res=>{
      console.log(res.data.otp)
      setValidOtp(res.data.otp)
      setLoading(false);
    })
    .catch(e=>console.log(e))
   }else{
    setMessage("Enter an email!");
    setLoading(false);
   }
  };
 
  const handleShowPassword = () =>{
    if(isPasswordSecure){
      setHide(true);
      setIsPasswordSecure(false)
    }else{
      setHide(false);
      setIsPasswordSecure(true)
    }
  }

  const handleUpdatePassword = () => {

    if (password !== "" && password === confirmPassword) {
      
      console.log('email',email)

      axios.put(`${config.API_URL}/api/users/password`, {password, email})
      .then(res =>{
        ToastAndroid.show('Password updated!', ToastAndroid.SHORT);
        console.log(res.data)
        setPassword('');
        setConfirmPassword('');
          // Add a 2-second delay before redirecting to the Login page
          setTimeout(() => {
            navigation.navigate('Login');
          }, 2000); // 2000 milliseconds = 2 seconds
        })
      .catch(e=>{
        setMessage(e.response.data.msg)
      })
    }else if (password !== confirmPassword) {
      setMessage("Password doesn't match!");
    }else if (password.trim() === '' || password.trim() === '') {
      setMessage("Enter the required fields!");
    }
  };

  return (
    <ScrollView style={{backgroundColor:'#fff', flex:1}}>

       {/* header */}
        <TouchableHighlight onPress={()=>navigation.goBack()} underlayColor='#fff'
        style={{marginTop:10, padding:10, }}
          >
        <MaterialIcons name="arrow-back" size={24} color="#152370" />
        </TouchableHighlight>

 {/* login components */}
  <View style={styles.container}>
    
    {/* kuzuzangpo */}
    <Text style={{
        textAlign: 'center',
        fontWeight: 'bold',
        color:"#152370",
        letterSpacing: 4,
        fontSize: 25,
        marginTop:20
      }}>LaTshong</Text>

    <Image style={{ width: 300, height: 200, alignSelf:"center" }} source={require("../../assets/images/forgotpassword.png")} />
      
      <Text style={{
      textAlign: 'center',
      fontWeight:'200',
      fontSize: 20,
      marginTop:10
      }}>Forgot Password</Text>

    <View style={{marginTop:30, marginBottom:20}}>
      <Text style={{color:'grey'}}>
        { !validOtp && 'Enter an email associated with your LaTshong account'}
        { validOtp && validOtp !== otp && `Enter the OTP sent to ${email}`}
        { validOtp.trim() !== '' && validOtp === otp && 'Enter a new password for your account'}
        </Text>
      </View>  

        {message !== "" && message && 
        <>
        <View style={{backgroundColor:'rgba(255, 0, 0, 0.1)', 
          borderRadius:2, padding:10, marginBottom:10}}>
        <Text style={{color:'rgba(255, 0, 0, 0.6)', fontWeight:"300", textAlign:"center"}}>{message}</Text>
        </View>
        </>}

      {
        !validOtp && //hide email input if otp received from backend
        <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={(t)=>setEmail(t.trim())}
        onFocus={()=>setMessage("")}
        style={{fontSize:14}}
        theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
      />
      }

      {/* if user otp and valid otp matches show password inputs */}
      { validOtp === otp && validOtp && validOtp !== '' && 
        <>
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onFocus={()=>setMessage("")}
            onChangeText={setPassword}
            secureTextEntry={isPasswordSecure}
            right={<TextInput.Icon icon={hide ? 'eye' : 'eye-off'}
            onPress={handleShowPassword}/>}
            style={{fontSize:14, marginTop:10}}
            theme={{ colors: { placeholder: '#000', text: '#000',
            primary: '#4942E4',underlineColor:'transparent', background:'#fff',
            outline:"lightgrey"}}}
          />
          <TextInput
            mode="outlined"
            label=" Confirm Password"
            value={confirmPassword}
            onFocus={()=>setMessage("")}
            onChangeText={setConfirmPassword}
            secureTextEntry={isPasswordSecure}
            right={<TextInput.Icon icon={hide ? 'eye' : 'eye-off'}
            onPress={handleShowPassword}/>}
            style={{fontSize:14, marginTop:10}}
            theme={{ colors: { placeholder: '#000', text: '#000',
            primary: '#4942E4',underlineColor:'transparent', background:'#fff',
            outline:"lightgrey"}}}
          />
        </>
      }

      {/* if otp is sent from the server */}
      { validOtp && validOtp !== otp && 
        <TextInput
          mode="outlined"
          label="One Time Password"
          value={otp}
          onChangeText={setOtp}
          onFocus={()=>setMessage("")}
          style={{fontSize:14,}}
          theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
          />
      }

      {
        !otp &&
        <TouchableHighlight style={styles.button} onPress={handleRequestOTP} underlayColor='#1E319D'>
          {
            loading ? 
            <ActivityIndicator size='small' color="#fff" /> 
            :
          <Text style={styles.buttonText}>Request OTP</Text>
        }
        </TouchableHighlight>
      }

      {
        validOtp !== '' && validOtp === otp && 
        <TouchableHighlight style={styles.button} onPress={handleUpdatePassword} underlayColor='#1E319D'>
          <Text style={styles.buttonText}>Confrim</Text>
        </TouchableHighlight>
      }

    <View style={{flexDirection:'row', marginTop:70, justifyContent:'center', marginBottom:10}}>
      <Text style={{fontWeight:'300'}}>Don't have a account?</Text>
      <TouchableOpacity 
      onPress={() => { navigation.navigate('Signup');}}
      style={{
      }}
      >
      <Text style={{marginLeft:5, fontWeight:"700", color:'#1E319D'}} onPress={()=> navigation.navigate("Signup")}>Register Now</Text>
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
    borderTopEndRadius:50,borderTopStartRadius:50,
  },
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
