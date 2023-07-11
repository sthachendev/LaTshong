import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, TouchableHighlight} from "react-native";
import axios from "axios";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import config from "../config";
import { capitalizeWords } from "../fn";

export default ViewProfile = ({route, navigation}) => {
  const {userid} = route.params;
  const [userInfo, setUserInfo] = useState('');

  useEffect(() => {
    fetchUserInfo();

    return () => {
      setUserInfo('')
    }

  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/get_user_info/${userid}`);
      setUserInfo(response.data);
    console.log(response.data,'response');

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <Text>id: {userid}</Text>

      {userInfo ? (
        <>
          {/* profile image */}

          <Text>Name: {userInfo[0].name}</Text>
          <Text>Email: {userInfo[0].email}</Text>
          {/* Add more fields as needed */}
        
      <Button title="Message" onPress={() => navigation.navigate('ChatRoom', {touserid: userid, title: capitalizeWords(userInfo[0].name) })} />
        </>
      ) : (
        <Text>Loading user information...</Text>
      )}

      {/* posts */}

      {/* btn to post */}

    </View>
  );
};

const styles = StyleSheet.create({
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
})