import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";

const Support = () => {
  const handleContactSupport = () => {
    const supportEmail = "support@example.com";
    const url = `mailto:${supportEmail}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        If any problems arise between employers and employees, please contact us
        at:
      </Text>
      <TouchableOpacity
        style={styles.emailButton}
        onPress={handleContactSupport}
      >
        <Text style={styles.email}>support@example.com</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  message: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  emailButton: {
    padding: 10,
    backgroundColor: "#2196F3",
    borderRadius: 5,
  },
  email: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Support;
