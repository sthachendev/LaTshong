import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, Dimensions, FlatList } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import config from "../config";
import { Ionicons } from "@expo/vector-icons";
import CustomModal from "../custom/CustomModal";
import { Keyboard } from "react-native";

export default function Explore({ navigation }) {

  const [userLocation, setUserLocation] = useState(null);
  const [data, setData] = useState([]);//set loaction marker for each job posts

  const [selectedMarkerData, setSelectedMarkerData] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

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
  }, []);

  useEffect(()=>{
      getJobPost();

    return () => {
     setData([]);
    };
    
  },[])

  const getJobPost = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/api/get_job_post_location`);//no token required
      console.log('explore', res.data);
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to handle marker click and open modal
  const handleMarkerClick = (markerData) => {
    setSelectedMarkerData(markerData);
    setIsModalVisible(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setIsModalVisible(false);
    });
  
    return unsubscribe;
  }, [navigation]);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsModalVisible(true);
      Keyboard.dismiss();//keep keyboard dismiss
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          backgroundColor: "#fff",
          // marginTop:20
        }}
      >

    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        marginHorizontal: 5,
        backgroundColor: '#F1F2F6',
        borderRadius: 10,
      }}
    >
      <Icon
        name="search"
        size={18}
        color="grey"
        style={{ marginHorizontal: 10 }}
      />
      <TextInput
        style={{
          flex: 1,
          fontSize: 14,
        }}
        placeholder="Search Job"
        onFocus={()=>{
          navigation.navigate('Search');
          Keyboard.dismiss();
        }}

      />
    </View>
 
      </View>

      <View style={styles.container}>
        <View style={styles.myMap}>
          <MapView
            style={{ flex: 1 }}
            showsUserLocation
            provider={PROVIDER_GOOGLE}
            mapType="standard"
            initialRegion={userLocation}
          >
            {/* {userLocation && (
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
            )} */}
            
          {data.map((data) => (
            <Marker
              key={data.id}
              coordinate={{
                latitude: data.location.latitude,
                longitude: data.location.longitude,
              }}
              onPress={() => handleMarkerClick(data)} // Call handleMarkerClick on marker press
            >
              <Ionicons name="pin" size={40} color='#1E319D'/>

              <Callout>
              <Ionicons name="eye" size={20} color='#1E319D'/>
              </Callout>
              {/* <Callout >
              <View style={{ width: Dimensions.get('window').width, backgroundColor:"transparent"}} tooltip>
                <View style={{ alignSelf: 'center'}}>
                  <Text style={{ alignSelf: 'center' }} >{data.job_title}</Text>
                </View>
              </View>
              </Callout> */}
            </Marker>
          ))}
          </MapView>
          <View>
          
          {/* modal to display the details */}
          <CustomModal isModalVisible={isModalVisible} navigation={navigation} 
          closeModal={closeModal} selectedMarkerData={selectedMarkerData} />
      
      </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  myMap: {
    flex: 1,
    backgroundColor: "white",
    width: "100%",
  },
});
