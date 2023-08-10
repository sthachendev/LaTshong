import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Video } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';

export default function VideoPlayer({ videoUri }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = async () => {
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!status.isPlaying);
  };

  const handleProgressChange = async (value) => {
    await videoRef.current.setPositionAsync(value * status.durationMillis);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{
          uri: videoUri
        }}
        useNativeControls={false}
        resizeMode="contain"
        isLooping
        onPlaybackStatusUpdate={status => setStatus(status)}
      />

      <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
        <AntDesign name={isPlaying ? 'pause' : 'play'} size={24} color={isPlaying?"transparent":'#fff'} />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <TouchableOpacity
          style={styles.progressBar}
          activeOpacity={1}
          onPress={(e) => {
            const progressWidth = e.nativeEvent.layout.width;
            const touchX = e.nativeEvent.locationX;
            const progress = touchX / progressWidth;
            handleProgressChange(progress);
          }}
        >
          <View
            style={[
              styles.progress,
              { width: `${(status.positionMillis / status.durationMillis) * 100}%` },
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  video: {
    alignSelf: 'center',
    width: '100%',
    height: 200,
  },
  playPauseButton: {
    position: 'absolute',
    bottom: '40%', // Adjust this value as needed
    left: '50%',
    transform: [{ translateX: -12 }], // Adjust this value to horizontally center the button
    zIndex: 1,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    flex: 1,
  },
  progress: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});
