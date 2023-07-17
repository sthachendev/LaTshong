import { Text, View, Modal, TouchableWithoutFeedback, Button} from "react-native";
import { useSelector } from "react-redux";

//used to show the result on press on particular location
export default CustomFunction = ({isModalVisible, closeModal, selectedMarkerData, navigation }) => {
    
    const role = useSelector(state => state.token);
    console.log(selectedMarkerData.id,'selectedMarkerData');
    const postid = selectedMarkerData.id;
    
    return (
        <>
        {selectedMarkerData && (
          <Modal visible={isModalVisible} onRequestClose={closeModal} transparent={true} animationType="slide">
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={{
                backgroundColor: "transparent",
                height: "100%", // Set the height of the modal (half of the screen)
                // You can adjust the height to your desired value
            }}>
              
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>

              <View style={{
                 backgroundColor: "#fff",
                 padding: 16,
                 borderTopLeftRadius: 20,
                 borderTopRightRadius: 29,
                 position: "absolute", // Position the modal at the bottom
                 bottom: 0, // Align the modal to the bottom of the screen
                 left: 0,
                 right: 0,
                 height: "40%", // Set the height of the modal (half of the screen)
                 // You can adjust the height to your desired value
              }}>
              <Text>{selectedMarkerData.job_title}</Text>
              <Button title="close" onPress={() => navigation.navigate('PostDetails', { id: postid, role })}></Button>
              {/* Add any other details you want to show in the modal */}
              {/* You can also use a custom component for the modal */}
              </View>

            </TouchableWithoutFeedback>

            </View>
            </TouchableWithoutFeedback>

          </Modal>
        )}
        </>
    )
}