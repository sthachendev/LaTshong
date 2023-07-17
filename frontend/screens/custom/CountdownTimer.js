import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';

const CountdownTimer = ({ minutes }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(minutes * 60);

  useEffect(() => {
    // Start the countdown
    const interval = setInterval(() => {
      setRemainingSeconds((prevSeconds) => {
        if (prevSeconds === 0) {
          clearInterval(interval);
          // Perform any action when the countdown reaches zero
          // For example, show a message or trigger an event
          return 0;
        } else {
          return prevSeconds - 1;
        }
      });
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [minutes]);

  // Format the remaining seconds as minutes and seconds
  const formattedMinutes = Math.floor(remainingSeconds / 60);
  const formattedSeconds = remainingSeconds % 60;

  return (
    <View style={{display:'flex', flexDirection:'row', justifyContent:"center", alignContent:'center'}}>
      <Text
      style={{textAlign:'center', fontSize:30, color:"grey", marginVertical:10}}
      >{`${formattedMinutes.toString().padStart(2, '0')}:${formattedSeconds.toString().padStart(2, '0')}`}</Text>
    </View>
  );
};

export default CountdownTimer;
//used in otp