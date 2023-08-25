import React, { useState } from "react";
import { ToastAndroid, TouchableOpacity, View, StyleSheet } from "react-native";
import { TextInput, Text } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TouchableHighlight } from "react-native";
import { ScrollView } from "react-native";
import CountdownTimer from "../custom/CountdownTimer";
import config from "../config";
import axios from "axios";
import Spinner from "../custom/Spinner";

export default function SignupStep2({ navigation, route }) {
  const { email, validOtp, data } = route.params;

  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [newValidOtp, setNewValidOtp] = useState(validOtp);
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    try {
      const response = await axios.post(`${config.API_URL}/api/signup`, data);
      if (response.status) {
        ToastAndroid.show("Account created", ToastAndroid.SHORT);
        navigation.pop(2);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSignup = () => {
    setMessage("");
    if (otp.trim() === "") {
      setMessage("Ops, you didn't enter the OTP code.");
    } else if (otp !== newValidOtp) {
      setMessage("OTP doesn't match.");
    } else if (
      newValidOtp &&
      newValidOtp !== "" &&
      otp !== "" &&
      newValidOtp === otp
    ) {
      signup();
    }
  };

  const getOtp = () => {
    setLoading(true);
    axios
      .post(`${config.API_URL}/api/otp`, { email })
      .then((response) => {
        if (response.data.success) {
          setNewValidOtp(response.data.otp);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  if (loading) return <Spinner />;

  return (
    <ScrollView style={{ backgroundColor: "#fff", flex: 1 }}>
      <TouchableHighlight
        onPress={() => navigation.goBack()}
        underlayColor="#fff"
        style={{ marginTop: 10, padding: 10 }}
      >
        <MaterialIcons name="arrow-back" size={24} color="#152370" />
      </TouchableHighlight>

      <Text
        style={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#152370",
          letterSpacing: 4,
          fontSize: 25,
          paddingBottom: 10,
        }}
      >
        LaConnect
      </Text>

      <View style={styles.container}>
        <CountdownTimer
          minutes={15}
          newValidOtp={newValidOtp}
          setNewValidOtp={setNewValidOtp}
          navigation={navigation}
        />

        <View
          style={{ marginVertical: 10, marginBottom: message !== "" ? 0 : 30 }}
        >
          <Text
            style={{
              color: "grey",
            }}
          >
            OTP code sent to {email}, enter before it expires.
          </Text>
        </View>

        {message !== "" && message && (
          <>
            <View
              style={{
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                borderRadius: 2,
                padding: 10,
                marginVertical: 10,
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
          label="One Time Password"
          value={otp}
          onChangeText={setOtp}
          onFocus={() => setMessage("")}
          style={{ fontSize: 14 }}
          theme={{
            colors: {
              primary: "#4942E4",
              background: "#fff",
              outline: "lightgrey",
            },
          }}
          keyboardType="numeric" 
        />

        <View
          style={{
            marginVertical: 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TouchableHighlight
            style={styles.button}
            onPress={handleSignup}
            underlayColor="#1E319D"
          >
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableHighlight>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginVertical: 20,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "300" }}>Didn't get the OTP?</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Signup");
            }}
          >
            <Text
              style={{ marginLeft: 5, fontWeight: "700", color: "#1E319D" }}
              onPress={() => getOtp()}
            >
              Resend
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
    borderTopEndRadius: 50,
    borderTopStartRadius: 50,
  },
  button: {
    width: "100%",
    backgroundColor: "#1E319D",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 20,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
