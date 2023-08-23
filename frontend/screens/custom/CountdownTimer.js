import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';

const CountdownTimer = ({ minutes, navigation, setNewValidOtp }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(minutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prevSeconds) => {
        if (prevSeconds === 0) {
          clearInterval(interval);
          setNewValidOtp(null);
          navigation.goBack();
          return 0;
        } else {
          return prevSeconds - 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [minutes]);

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