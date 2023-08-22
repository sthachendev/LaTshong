import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableHighlight, ToastAndroid } from "react-native";
import { TextInput } from "react-native-paper";
import axios from "axios";
import config from "../config";

export default function ChangeName({ navigation, route }) {
  
  const { userid } = route.params;

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveChanges = () => {

    if (middleName !== "" && middleName === lastName) {

      setLoading(true);

      axios.put(`${config.API_URL}/api/users/${userid}/password`, {firstName, middleName:middleName})
      .then(res =>{
        ToastAndroid.show(res.data.msg, ToastAndroid.SHORT);
        setLoading(false);
        setFirstName('');
        setMiddleName('');
        setLastName('');
      })
      .catch(e=>{
        console.log(e.response.data.msg);
        setLoading(false);
        setMessage(e.response.data.msg);
      })

      console.log('password updated.');
    }else if (middleName !== lastName) {
      setMessage("Password doesn't match!");
    }else if (middleName.trim() === '' || middleName.trim() === '' || firstName.trim()) {
      setMessage("Enter the required fields!");
    }
  };

  return (
    <View style={{flex:1, backgroundColor:"#fff", padding:10}}>
      <Text style={{
      textAlign: 'center',
      fontWeight:'200',
      fontSize: 20,
      marginTop:10,
      marginBottom:20
      }}>Change Name</Text>

    {message !== "" && message && 
    <>
    <View style={{backgroundColor:'rgba(255, 0, 0, 0.1)', marginBottom:20,
      borderRadius:2, padding:10,}}>
    <Text style={{color:'rgba(255, 0, 0, 0.5)', fontWeight:"300", textAlign:"center"}}>{message}</Text>
    </View>
    </>}
      
    <TextInput
      mode="outlined"
      label="Current Password"
      secureTextEntry
      value={firstName}
      onFocus={()=>setMessage("")}
      onChangeText={setFirstName}
      style={{ fontSize:14,}}
      theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
    />

    <TextInput
        mode="outlined"
        label="New Password"
        secureTextEntry
        value={middleName}
        onFocus={()=>setMessage("")}
        onChangeText={setMiddleName}
        style={{ fontSize:14, marginTop:20}}
        theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
    />

    <TextInput
        mode="outlined"
        label="Confirm New Password"
        secureTextEntry
        value={lastName}
        onFocus={()=>setMessage("")}
        onChangeText={setLastName}
        style={{ fontSize:14, marginTop:20}}
        theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
    />

    <TouchableHighlight style={styles.button} onPress={handleSaveChanges} underlayColor='#1E319D'>
        <Text style={styles.buttonText}>
        {loading ? <ActivityIndicator size='small' color="#fff" /> : 'Update'}
        </Text>
    </TouchableHighlight>
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
