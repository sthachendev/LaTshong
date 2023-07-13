import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const Spinner = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1E319D" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});

export default Spinner;
