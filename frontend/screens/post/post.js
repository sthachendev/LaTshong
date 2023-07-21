import { StyleSheet, Text, View, TouchableOpacity, ToastAndroid, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TextInput, Switch} from 'react-native-paper';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import config from '../config';
import { useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const Post = ({navigation}) => {

  const [isToggled, setToggle] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [customLocation, setCustomLocation] = useState(null)

  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReq, setJobReq] = useState('');
  const [jobSalary, setJobSalary] = useState('');

  const [vacancy_no, setVacancyNo] = useState('');
  const [remark, setRemark] = useState('');
  const [location, setLocation] = useState('');

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleToggle = () => {
    setToggle(!isToggled);
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync();
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          });
        } else {
          console.log("Location permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestLocationPermission();
  }, [isToggled]);

  const token = useSelector((state) => state.token);

  const handleSubmit = async() => {
    const userid = jwtDecode(token).userid;
    const jobData = {
      job_title: jobTitle,
      job_description: jobDesc,
      nature: selectedValue,
      vacancy_no: vacancy_no,
      location_: location,
      job_requirements: jobReq,
      job_salary: jobSalary,
      postby: userid,
      location: isToggled ? userLocation: customLocation,
      remark
    };
    
    try {
      const response = await axios.post(`${config.API_URL}/api/job_post`, jobData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setJobTitle("");
      setJobDesc("");
      setJobReq("");
      setJobSalary("");
      if(response.status == 201){
        ToastAndroid.show("Posted", ToastAndroid.SHORT);
        navigation.goBack();
      }

    }catch (error) {
      console.error(error);
    }
    
  };

  const pickerOptions = [
    { label: 'Regular', value: 'regular' },
    // { label: 'Part Time', value: 'part time' },
    { label: 'Contract', value: 'contract' },
  ];
  //nature of employment
  const [selectedValue, setSelectedValue] = useState('regular');

  return (
    <>
     {/* header */}
     <View style={styles.buttonContainer2}>
      <TouchableOpacity onPress={handleCancel} style={{borderRadius:15}}
        >
      <MaterialIcons name="close" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={1}>
        <Text style={styles.buttonText2}>New Job Post</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSubmit} style={{borderRadius:15}}
        >
      <MaterialIcons name="check" size={24} color="#0079FF" />
      </TouchableOpacity>
    </View>
<ScrollView>
    <View style={styles.container}>

    <TextInput
      mode="outlined"
      label="Job Title / Designation"
      value={jobTitle}
      onChangeText={setJobTitle}
      style={styles.input}
      theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
    />

      <TextInput
      mode="outlined"
      label="Description"
      value={jobDesc}
      onChangeText={setJobDesc}
      style={styles.input2}
      theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
      multiline={true}
      blurOnSubmit={true}
      />

    <View style={{
        borderWidth: 1,
        borderColor: 'lightgrey',
        borderRadius: 4,
        marginTop:20,
      }}>
    <Picker
      selectedValue={selectedValue}
      onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
      prompt="Nature of Employment"
    >
      {pickerOptions.map((option, index) => (
        <Picker.Item
          key={index}
          label={option.label}
          value={option.value}
          style={{
            fontSize:14,
          }}
        />
      ))}
    </Picker>
    </View>

    <TextInput
      mode="outlined"
      label="No. of Vacancy"
      value={vacancy_no}
      onChangeText={setVacancyNo}
      style={styles.input}
      theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
    />

      <TextInput
      mode="outlined"
      label="Requirement | Qualification"
      value={jobReq}
      onChangeText={setJobReq}
      style={styles.input2}
      theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
      multiline={true}
      blurOnSubmit={true}
      />

      <TextInput
      mode="outlined"
      label="Salary"
      value={jobSalary}
      onChangeText={setJobSalary}
      style={styles.input}
      theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
    />

    <TextInput
      mode="outlined"
      label="Location"
      value={location}
      onChangeText={setLocation}
      style={styles.input}
      theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
    />

    <TextInput
      mode="outlined"
      label="Remarks"
      value={remark}
      onChangeText={setRemark}
      style={styles.input2}
      theme={{ colors: { primary: '#4942E4', background:'#fff', outline:"lightgrey"}}}
      multiline={true}
      blurOnSubmit={true}
      />

  <Text 
  style={{color:"grey", marginTop:10, paddingTop:10, borderColor:'lightgrey', borderTopWidth:0.5}}>
    This location would help job seeker to find job near them.</Text>

    <View  style={{ flexDirection: "row", alignItems: "center", }}>
    <Text>Add Current Location</Text>
    <Switch value={isToggled} onValueChange={handleToggle} color='#3a348e' />
    
    <Text>Select location</Text>
    <Switch value={!isToggled} onValueChange={handleToggle} color='#3a348e' />
    </View>
    {!isToggled && <Text style={{color:"grey"}}>Tab on the map to set the location</Text>}
  </View>
  
    <View style={styles.myMap}>
    <MapView
      style={{ flex: 1 }}
      showsUserLocation
      provider={PROVIDER_GOOGLE}
      mapType="standard"
      initialRegion={userLocation}
      onPress={(e) => setCustomLocation(e.nativeEvent.coordinate)}
    >
      {userLocation && isToggled &&  (
        <Marker
          title="Current Location"
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
        >
          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutText}>Current Location</Text>
            </View>
          </Callout>
        </Marker>
      )}
      {customLocation!=null && !isToggled ?
    <Marker
      draggable
      coordinate={customLocation}
    >
      <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutText}>Custom Location</Text>
            </View>
          </Callout>
    </Marker>:null}
    </MapView>
  </View>

  </ScrollView>

  </>
);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    // alignItems:'center',
    paddingHorizontal:10
  },
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
  input: {
    fontSize:14,
    marginTop:20
  },
  input2: {
    fontSize:14,
    height: 100,
    marginTop:20,
    textAlignVertical: "top",
    justifyContent: "flex-start",
  },
  myMap: {
    // flex: 1,
    height:250,
    backgroundColor: "white",
    width: "100%",
    // paddingHorizontal:10
  },
});

export default Post;