import React from "react";
import { TouchableHighlight } from "react-native";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from "react-native";

const Support = () => {
  const handleContactSupport = () => {
    const supportEmail = "support@example.com";
    const url = `mailto:${supportEmail}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
    <Image style={{ width: 200, height: 200, alignSelf:"center" }} source={require("../../assets/images/mail.png")} />

      <Text style={styles.message}>
        If any disputes arise between the parties, please contact us
        at:
      </Text>
      <TouchableHighlight underlayColor='#F1F2F6'
        style={styles.emailButton}
        onPress={handleContactSupport}
      >
        <Text style={styles.email}>support@example.com</Text>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor:"#fff",
    flex:1
  },
  message: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  emailButton: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth:.25,
    marginVertical:15
  },
  email: {
    color: "#000",
    fontSize: 16,
    // fontWeight: "bold",
    textAlign: "center",
  },
});

export default Support;
