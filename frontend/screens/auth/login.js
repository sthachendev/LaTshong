import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { TextInput ,Text } from "react-native-paper";
import { useDispatch } from 'react-redux';
import { setToken, setRole } from '../../reducers'; 
import config from '../config';
import axios from "axios";
import jwtDecode from 'jwt-decode';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TouchableHighlight } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { ScrollView } from "react-native";
import { ActivityIndicator } from "react-native";

export default function Login({navigation}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hide, setHide] = useState(false);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  useEffect(()=>{
    if (isFocused){
      setMessage("");
      setEmail("");
      setPassword("");
    }
  }, [navigation,isFocused])

  const handleLogin = async() => {
   if(email.trim() !== "" && password.trim() !== ""){
    setLoading(true);
    try {
      const response = await axios.post(`${config.API_URL}/api/login`, {
        email:email.trim(),
        password,
      });
      console.log(response.data);
      if (response.data) setLoading(false);
      console.log(jwtDecode(response.data.token).role)
      dispatch(setToken(response.data.token));
      dispatch(setRole(jwtDecode(response.data.token).role))

      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("role", jwtDecode(response.data.token).role);

      navigation.navigate('Home');
      
    }catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(error.response.data.message);
        setMessage(error.response.data.message)
      } else {
        console.log(error.message);
      }
    }
   }else{
    setMessage("Enter both email & password!");
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

  // if(loading) return <Spinner/>

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
    
    <View style={{alignItems:'center'}}>
    <Image style={{ width: 108, height: 105, }} source={require("../../assets/images/gov_logo.jpg")} />
    {/* <View style={{backgroundColor:"lightgrey", width: 70, height: 70, borderRadius:45}}/> */}

    <Text style={{
      textAlign: 'center',
      fontWeight:'200',
      fontSize: 21,
      marginTop:10
      }}>བཟོ་གྲྭ་ཚོང་ལས་དང་ལཱ་གཡོག་ལྷནཁག།</Text>


      <Text style={{
      textAlign: 'center',
      fontWeight:'200',
      fontSize: 20,
      marginTop:10
      }}>Department of Labour</Text>

    </View>

    {/* kuzuzangpo */}
    <Text style={{
        textAlign: 'center',
        fontWeight: 'bold',
        color:"#152370",
        letterSpacing: 4,
        fontSize: 25,
        // paddingVertical:10,
        marginTop:20
      }}>LaTshong</Text>


    <View style={{marginTop:30, marginBottom:20}}>
      <Text style={{
        // textAlign: 'center',
        // fontWeight:'100',
        // fontSize: 20,
        color:'grey'
        }}>Login to your account</Text>
      </View>  

        {message !== "" && message && 
        <>
        <View style={{backgroundColor:'rgba(255, 0, 0, 0.1)', 
          borderRadius:2, padding:10, marginBottom:10}}>
        <Text style={{color:'rgba(255, 0, 0, 0.6)', fontWeight:"300", textAlign:"center"}}>{message}</Text>
        </View>
        </>}

       <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          onFocus={()=>setMessage("")}
          style={{fontSize:14}}
          theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
        />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onFocus={()=>setMessage("")}
            onChangeText={setPassword}
            secureTextEntry={isPasswordSecure}
            right={<TextInput.Icon icon={hide ? 'eye' : 'eye-off'}
            onPress={handleShowPassword}/>}
            style={{fontSize:14, marginTop:30}}
            theme={{ colors: { placeholder: '#000', text: '#000',
            primary: '#4942E4',underlineColor:'transparent', background:'#fff',
            outline:"lightgrey"}}}
          />
          <View style={{alignSelf:'flex-end',marginTop:10}}>
            <TouchableOpacity onPress={()=> navigation.navigate("ForgotPassword")}>
            <Text style={{color:'#1E319D',fontSize:13,fontWeight:'300'}}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableHighlight style={styles.button} onPress={handleLogin} underlayColor='#1E319D'>
            <Text style={styles.buttonText}>{loading ? <ActivityIndicator size='small' color="#fff" /> : 'Log In'}</Text>
          </TouchableHighlight>

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
    // alignItems: "center",
    paddingHorizontal:40,
    backgroundColor:'#fff',
    borderTopEndRadius:50,borderTopStartRadius:50,
    // elevation:5
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
