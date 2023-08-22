import React from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, TouchableHighlight, StyleSheet } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const OnboardingScreen = ({ navigation, onComplete }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor:'#fff' }}>
        
        <Text style={styles.appTitle}>LaConnect</Text>
        <Onboarding
        onSkip={() => onComplete()}
        onDone={() => onComplete()}
        bottomBarHighlight={false} // Disable bottom bar highlight
        pages={[
          {
            backgroundColor: 'red',
            image: <Image source={require('../../assets/images/gov_logo.jpg')} />,
            title: 'Grab every opportunity that comes your way',
            subtitle: '',
            contentContainerStyle: {  justifyContent: 'center' },
          },
          {
            backgroundColor: '#fff',
            image: <Image style={{ width: 108, height: 105, }} source={require('../../assets/images/ob1.jpg')} />,
            title: 'Getting Started',
            subtitle: 'Sign up as Job Seeker or Employer',
            contentContainerStyle: {  justifyContent: 'center' },
          },
          {
            backgroundColor: '#fff',
            image: <Image style={{ width: 108, height: 105, }} source={require('../../assets/images/gov_logo.jpg')} />,
            title: 'Job Seeker',
            subtitle: 'Search jobs through map.Apply for jobs. Upload Cetificates',
            contentContainerStyle: {  justifyContent: 'center' },
          },
          {
            backgroundColor: '#fff',
            image: <Image style={{ width: 108, height: 105, }} source={require('../../assets/images/gov_logo.jpg')} />,
            title: 'Employer',
            subtitle: 'Find skilled worker through job post. Post photos and videos',
            contentContainerStyle: {  justifyContent: 'center' },
          },
          {
            backgroundColor: '#fff',
            image: <Image style={{ width: 108, height: 105, }} source={require('../../assets/images/gov_logo.jpg')} />,
            title: <Text style={{
                fontWeight: 'bold',
                color:"#152370",
                letterSpacing: 4,
                fontSize: 25,
              }}>LaConnect</Text>,
              subtitle:'',
            contentContainerStyle: {  justifyContent: 'center' },
          },
        ]}
        renderNext={onboardingContext => (
          <TouchableOpacity onPress={onboardingContext.next}>
            <Text>Next</Text>
          </TouchableOpacity>
        )}
      />

<TouchableHighlight
        style={styles.loginButton}
        onPress={onComplete}
        underlayColor="#1E319D"
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableHighlight>

      <Text style={styles.signUpText}>
        New to LaConnect? Sign Up or Later
      </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appTitle: {
    fontWeight: 'bold',
    color: "#152370",
    letterSpacing: 4,
    textAlign: 'center',
    fontSize: 25,
    paddingTop: 50,
  },
  loginButton: {
    width: '90%',
    backgroundColor: '#1E319D',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: 'bold',
  },
  signUpText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#1E319D',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default OnboardingScreen;
