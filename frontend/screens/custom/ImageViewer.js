import { View, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ImageViewer = ({ uri, modalVisible, setModalVisible }) => {
 
  return (
    <View style={styles.container}>

      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
          <MaterialIcons name="close" size={30} color='#fff' />
          </TouchableOpacity>
          <Image source={{ uri }} style={styles.zoomedImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 200,
    height: 200,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  zoomedImage: {
    width: '90%',
    height: '90%',
  },
});

export default ImageViewer;
