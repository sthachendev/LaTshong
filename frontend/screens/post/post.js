import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
import { TextInput, Switch} from 'react-native-paper';
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import config from '../config';
import { useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

const Post = () => {
 
  const navigation = useNavigation();

  const [isToggled, setToggle] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [customLocation, setCustomLocation] = useState(null)

  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReq, setJobReq] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  
  // const [refreshing, setRefreshing] = React.useState(false);

  // const onRefresh = React.useCallback(() => {
  //   setRefreshing(true);
  //   wait(2000).then(() => setRefreshing(false));
  // }, []);

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
    job_requirements: jobReq,
    job_salary: jobSalary,
    postby: userid,
    location: isToggled ? userLocation: customLocation,
    status: 'p',
  };
  
  try {
    const response = await axios.post(`${config.API_URL}/api/job_post`, jobData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.status);    // Access the status code

  }catch (error) {
    console.error(error);
  }
};
    return (
      <>
        <View 
      style={styles.container}
      >
        {/* header */}
        <View style={styles.buttonContainer2}>
          <TouchableOpacity onPress={handleCancel} activeOpacity={.8}>
          <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} activeOpacity={1}>
            <Text style={styles.buttonText2}>New Post</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={.8} onPress={handleSubmit}>
          <MaterialIcons name="check" size={24} color="#0079FF" />
          </TouchableOpacity>
        </View>

        <TextInput
            mode="outlined"
            label="Job Title"
            value={jobTitle}
            onChangeText={setJobTitle}
            style={styles.input}
           
          />
         <TextInput
          mode="outlined"
          label="Job Descriptions"
          value={jobDesc}
          onChangeText={setJobDesc}
          style={styles.input2}
          multiline={true}
        />
         <TextInput
          mode="outlined"
          label="Job requirements"
          value={jobReq}
          onChangeText={setJobReq}
          style={styles.input2}
          multiline={true}
        />
          <TextInput
          mode="outlined"
          label="Salary"
          value={jobSalary}
          onChangeText={setJobSalary}
          style={styles.input}
        />
        {/* <TouchableOpacity style={{marginTop:20, backgroundColor:'#3a348e', borderRadius:25}}>
          <Text style={{ color:'#fff', paddingHorizontal:20, paddingVertical:10}}>
          Add  Current Location
          </Text>
        </TouchableOpacity> */}

        <View  style={{ flexDirection: "row", alignItems: "center", marginTop:10,}}>
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
      </>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems:'center'
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
    width: 270,
    marginTop:20,
    fontSize:13,
    backgroundColor: "#fff",
    width: "95%",
    borderRadius: 10,
  },
  input2: {
    width: 270,
    marginTop:20,
    fontSize:13,
    backgroundColor: "#fff",
    width: "95%",
    height: 100,
    textAlignVertical: "top",
    borderRadius: 10,
    justifyContent: "flex-start",
  },
  myMap: {
    flex: 1,
    backgroundColor: "white",
    width: "100%",
  },
});

export default Post;