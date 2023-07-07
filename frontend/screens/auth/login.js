import React, { useState } from "react";
import {
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

import { TextInput ,Text} from "react-native-paper";
// import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setToken, clearToken, setRole, clearRole } from '../../reducers'; 
import config from '../config';
import axios from "axios";
import jwtDecode from 'jwt-decode';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eye, setEye] = useState("eye");
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const navigation = useNavigation();

  const dispatch = useDispatch();

  const handleLogin = async() => {
    try {
      const response = await axios.post(`${config.API_URL}/api/login`, {
        email,
        password,
      });
      console.log(response.data);
      console.log(jwtDecode(response.data.token).role)
      dispatch(setToken(response.data.token));
      dispatch(setRole(jwtDecode(response.data.token).role))

      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("role", jwtDecode(response.data.token).role);

    }catch (error) {
      console.error(error);
    }
  };
 
  const passwordVisibility = () => {
    if (isPasswordSecure) {
      setIsPasswordSecure(false);
      setEye("eye-off");
    } else {
      setIsPasswordSecure(true);
      setEye("eye");
    }
  }

  const handleSignupBtn = () => {
    navigation.navigate("Signup")
  }

  const handleForgotPasswordBtn = () => {
    navigation.navigate("ForgotPassword");
  }

  return (
    <SafeAreaView style={{backgroundColor:'#3a348e', flex:1}}>
    <View style={{ height:150}}>
    <Text style={{
        textAlign: 'center',
        fontWeight: 'bold',
        color:"#fff",
        letterSpacing: 4,
        fontSize: 25,
        paddingTop:60
      }}>KUZUZANGPO LA!</Text>
    </View>
      <View style={styles.container}>
    
    <View>
  
    <View style={{alignItems:'center', marginTop:50}}>
    {/* <Image style={{ width: 100, height: 50 }} source={require("../../assets/icon.png")} /> */}
    </View>
    <TouchableOpacity style={{marginTop:40, marginBottom:30}}>
      <Text style={{
        textAlign: 'center',
        fontWeight:'200',
        fontSize: 20,
        }}>Login to your account</Text>
      </TouchableOpacity>  
       <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            theme={{
              colors: {
                primary: isFocused ? '#000' : '#4942E4',
                underlineColor: 'transparent',
              },
            }}
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={isPasswordSecure}
            right={<TextInput.Icon icon={eye} onPress={passwordVisibility}/>}
            style={styles.input}
            theme={{
              colors: {
                primary: isFocused ? '#000' : '#4942E4',

              },

            }}
          />
          <View style={{alignSelf:'flex-end',marginTop:10}}>
            <TouchableOpacity onPress={handleForgotPasswordBtn}>
            <Text style={{color:'#2F58CD',fontSize:13,fontWeight:'300'}}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop:20, display:'flex', justifyContent:"center"}}>
          <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={.7}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          </View>

    <View style={{flexDirection:'row', marginTop:60, justifyContent:'center'}}>
      <Text style={{fontWeight:'300'}}>Don't have a account?</Text>
      <TouchableOpacity 
      onPress={() => { navigation.navigate('Signup');}}
      style={{
      }}
      >
      <Text style={{marginLeft:5, fontWeight:"300", color:'#4942E4'}} onPress={handleSignupBtn}>Signup</Text>
      </TouchableOpacity>

      </View>

    </View>
  </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor:'#fff',
    borderTopEndRadius:50,borderTopStartRadius:50,
  },
  input: {
    width: 270,
    marginTop:20,
    fontSize:13,
    backgroundColor:'white'
  },
  button: {
    // width: '90%',
    width: 270,
    backgroundColor: '#4942E4',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop:20,
    alignItems:'center'

  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight:'bold'
  },
});
