import React, { useState } from "react";
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

export default function ChangePassword({ route }) {
  const { userid } = route.params;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveChanges = () => {
    if (newPassword !== "" && newPassword === confirmPassword) {
      setLoading(true);

      axios
        .put(`${config.API_URL}/api/users/${userid}/password`, {
          currentPassword,
          newPassword: newPassword,
        })
        .then((res) => {
          ToastAndroid.show(res.data.msg, ToastAndroid.SHORT);
          setLoading(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        })
        .catch((e) => {
          setLoading(false);
          setMessage(e.response.data.msg);
        });
    } else if (newPassword !== confirmPassword) {
      setMessage("Password doesn't match.");
    } else if (
      newPassword.trim() === "" ||
      newPassword.trim() === "" ||
      currentPassword.trim()
    ) {
      setMessage("Enter the required fields.");
    }
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
        Change Password
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
        label="Current Password"
        secureTextEntry
        value={currentPassword}
        onFocus={() => setMessage("")}
        onChangeText={setCurrentPassword}
        style={{ fontSize: 14 }}
        theme={{
          colors: {
            primary: "#4942E4",
            background: "#fff",
            outline: "lightgrey",
          },
        }}
      />

      <TextInput
        mode="outlined"
        label="New Password"
        secureTextEntry
        value={newPassword}
        onFocus={() => setMessage("")}
        onChangeText={setNewPassword}
        style={{ fontSize: 14, marginTop: 20 }}
        theme={{
          colors: {
            primary: "#4942E4",
            background: "#fff",
            outline: "lightgrey",
          },
        }}
      />

      <TextInput
        mode="outlined"
        label="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onFocus={() => setMessage("")}
        onChangeText={setConfirmPassword}
        style={{ fontSize: 14, marginTop: 20 }}
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
