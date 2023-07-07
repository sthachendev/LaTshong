import React from 'react';
import { StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import store from './store';
import Stack from './routes/stack';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Provider store={store}>
        <Stack />
      </Provider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#4942E4',
  },
});
