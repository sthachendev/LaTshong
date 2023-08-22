import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const Tutorial = () => {
  return (
    <ScrollView style={styles.container}>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  policyText: {
    fontSize: 16,
  },
});

export default Tutorial;
