import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableHighlight,
  ToastAndroid,
} from "react-native";
import { TextInput } from "react-native-paper";
import axios from "axios";
import config from "../config";
import { useSelector } from "react-redux";

export default function ChangeName({ route }) {
  const { userid } = route.params;
  console.log(userid)

  const token = useSelector((state) => state.token);

  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(()=> {
    getUsername();
  },[userid])
  
  const getUsername = () => {
    axios
      .get(
        `${config.API_URL}/api/users/${userid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setName(res.data[0].name)
      })
      .catch((e) => console.log(e));
  }

  const handleSaveChanges = () => {
    axios
      .put(
        `${config.API_URL}/api/users/name/${userid}`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        ToastAndroid.show("Updated.", ToastAndroid.SHORT);
      })
      .catch((e) => console.log(e));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 10 }}>
      <Text
        style={{
          textAlign: "center",
          fontWeight: "200",
          fontSize: 20,
          marginTop: 10,
          marginBottom: 20,
        }}
      >
        Change Name
      </Text>

      {message !== "" && message && (
        <>
          <View
            style={{
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              marginBottom: 20,
              borderRadius: 2,
              padding: 10,
            }}
          >
            <Text
              style={{
                color: "rgba(255, 0, 0, 0.5)",
                fontWeight: "300",
                textAlign: "center",
              }}
            >
              {message}
            </Text>
          </View>
        </>
      )}

      <TextInput
        mode="outlined"
        label="User Name"
        value={name}
        onFocus={() => setMessage("")}
        onChangeText={setName}
        style={{ fontSize: 14 }}
        theme={{
          colors: {
            primary: "#4942E4",
            background: "#fff",
            outline: "lightgrey",
          },
        }}
      />

      <TouchableHighlight
        style={styles.button}
        onPress={handleSaveChanges}
        underlayColor="#1E319D"
      >
        <Text style={styles.buttonText}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : "Update"}
        </Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: "#1E319D",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 50,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
