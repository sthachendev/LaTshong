import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { TextInput ,Text, Switch, Checkbox } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TouchableHighlight, Image } from "react-native";
import { ScrollView } from "react-native";
import { validateInput, validateInputContainNumOnly } from "../fn";
import axios from "axios";
import config from "../config";

export default function Signup({navigation}) {

  // const [cid, setCid] = useState("");

  const [firsName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState("js");

  const [hide, setHide] = useState(false);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  const [message, setMessage] = useState("");
  
  const [isToggled, setToggle] = useState(true);
  const [checked, setChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  
  const handleToggle = () => {
    setToggle(!isToggled);

    if(!isToggled){
      setRole('js');
      console.log('js')
    }else{
      setRole('em');
    }
  };

  const handleNext = () => {

    setMessage("");
    
    const name = firsName + lastName;

   if (email.trim() !== "" && validateInput(name.trim()) &&
    password.trim() !== "" && confirmPassword.trim() && checked === true){
      console.log('ok')

      let name;

      if (middleName.trim() !== "") {
        name = firsName+' '+middleName+' '+lastName;
      } else {
        name = firsName+' '+lastName;
      }

      const data =  {
        email : email.trim(),
        name: name,
        password,
        role
      }
      setLoading(true);

      axios.post(`${config.API_URL}/api/getOTP`, { email })

      .then(response => {
        if (response.data.success){
          navigation.navigate('SignupStep2', {email, validOtp:response.data.otp, data});
          setLoading(false);
        }
        console.log('otp',response.data.otp)
      })
      .catch(error => {
        console.log(error)
      });
      
    }else if((email.trim() === "" || name.trim() === "" ||
    password.trim() === "" || confirmPassword.trim() === "")){
      setMessage("Fill up all the fields!")
    }else if (firsName === ""){
      setMessage("Enter your name!")
    }else if (!validateInput(name.trim())){
      setMessage("Invalid characters in name, specials characters are not allowed!")
    }else if (password !== "" && password !== confirmPassword){
      setMessage("Password doesn't match, check the password!")
    }else if ( checked !== true){
      setMessage("Uncheck checkbox!")
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

  return (
    <ScrollView style={{backgroundColor:'#fff', flex:1}}>
      {/* <Image source={require('../../assets/wave.png')} style={{position:"absolute", width:'90%', height:180}}/> */}

       {/* header */}
        <TouchableHighlight onPress={()=>navigation.goBack()} underlayColor='#fff'
        style={{marginTop:10, padding:10, }}
          >
        <MaterialIcons name="arrow-back" size={24} color="#152370" />
        </TouchableHighlight>

 {/* kuzuzangpo */}
    <Text style={{
        textAlign: 'center',
        fontWeight: 'bold',
        color:"#152370",
        letterSpacing: 4,
        fontSize: 25,
        paddingBottom:10,
      }}>LaTshong</Text>

 {/* login components */}
  <View style={styles.container}>
    
      <View style={{marginHorizontal:10, marginBottom:5}}>
      <Text style={{
        color:'grey'
        }}>Sign up to create an account</Text>
      </View>  

        {message !== "" && message && 
        <>
        <View style={{backgroundColor:'rgba(255, 0, 0, 0.1)', 
          borderRadius:2, padding:10,}}>
        <Text style={{color:'rgba(255, 0, 0, 0.5)', fontWeight:"300", textAlign:"center"}}>{message}</Text>
        </View>
        </>}

        <TextInput
          mode="outlined"
          label="First name"
          value={firsName}
          onChangeText={setFirstName}
          onFocus={()=>setMessage("")}
          style={{fontSize:14, marginTop:10,}}
          theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
        />

        <TextInput
          mode="outlined"
          label="Middle name"
          value={middleName}
          onChangeText={setMiddleName}
          onFocus={()=>setMiddleName("")}
          style={{fontSize:14, marginTop:10,}}
          theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
        />
         <TextInput
          mode="outlined"
          label="Last name"
          value={lastName}
          onChangeText={setLastName}
          onFocus={()=>setMessage("")}
          style={{fontSize:14, marginTop:10}}
          theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
        />

       <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          onFocus={()=>setMessage("")}
          style={{fontSize:14, marginTop:10}}
          theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
        />

        <View  style={{ flexDirection: "row", alignItems: "center", marginTop:10, justifyContent:'space-between'}}>
        <Text style={{color:!isToggled?'grey':'#000'}}>Job Seeker</Text>
        <Switch value={isToggled} onValueChange={handleToggle} color='#3a348e' />

        <Text style={{color:isToggled?'grey':'#000'}}>Employer</Text>
        <Switch value={!isToggled} onValueChange={handleToggle} color='#3a348e' />
        </View>

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

        <View style={{display:"flex", flexDirection:'row', marginTop:20, paddingRight:20}}>
        <Checkbox 
          status={checked?'checked':'unchecked'}
          color="#4942E4"
          onPress={()=>setChecked(!checked)}/>
          <Text>Yes, I understand and to the LaTshong Terms & policy.</Text>
          <Text></Text>
        </View>

          <View style={{ marginVertical:20, display:'flex', justifyContent:"center"}}>
          <TouchableHighlight style={styles.button} onPress={handleNext} underlayColor='#1E319D'>
            <Text style={styles.buttonText}>
              {loading ? <ActivityIndicator size='small' color="#fff" /> : 'Next'}
              </Text>
          </TouchableHighlight>
          </View>

          <View style={{flexDirection:'row', marginVertical:20, justifyContent:'center'}}>
      <Text style={{fontWeight:'300'}}>Already have a account?</Text>
      <TouchableOpacity 
      onPress={() => { navigation.navigate('Signup');}}
      style={{
      }}
      >
      <Text style={{marginLeft:5, fontWeight:"700", color:'#1E319D'}} onPress={()=> navigation.goBack()}>Log In</Text>
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
    // elevation:5,
    // marginHorizontal:5
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
