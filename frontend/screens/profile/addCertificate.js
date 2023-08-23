import {
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Image,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import axios from "axios";
import config from "../config";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";

export default AddCertificate = ({
  isModalVisible,
  setIsModalVisible,
  userid,
  getPost,
}) => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    delete result.cancelled;

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    try {
      const formData = new FormData();
      formData.append("postby", userid);
      formData.append("image", {
        uri: image,
        name: "image.jpg",
        type: "image/jpg",
      });

      await axios.patch(`${config.API_URL}/api/post-certificates`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImage(null);
      ToastAndroid.show("Posted.", ToastAndroid.SHORT);
      setIsModalVisible(false);
      getPost();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        transparent={true}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.9)",
              height: "100%",
              elevation: 2,
            }}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "60%",
                }}
              >
                {/* top close header and next/ post btn */}
                <View style={styles.buttonContainer2}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsModalVisible(false);
                      setImage("");
                    }}
                  >
                    <MaterialIcons name="close" size={24} color="black" />
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>Add Certificate</Text>
                  <View />
                </View>

                <View style={styles.container}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {image && (
                      <Image
                        source={{ uri: image }}
                        style={{
                          width: "95%",
                          height: 200,
                          borderWidth: 1,
                          borderRadius: 5,
                          borderColor: "lightgrey",
                        }}
                      />
                    )}

                    <TouchableOpacity
                      title="Pick an image from camera roll"
                      onPress={pickImage}
                      style={{
                        backgroundColor: "#fff",
                        padding: 10,
                        paddingHorizontal: 15,
                        borderRadius: 10,
                        marginTop: 30,
                        borderWidth: 0.5,
                        borderColor: "grey",
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: "grey" }}>
                        {!image ? "Upload Certificate" : "Change Certificate"}
                      </Text>
                    </TouchableOpacity>

                    {image && (
                      <TouchableHighlight
                        style={styles.button}
                        onPress={handlePost}
                        underlayColor="#1E319D"
                      >
                        <Text style={styles.buttonText3}>Add</Text>
                      </TouchableHighlight>
                    )}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  buttonContainer2: {
    backgroundColor: "#F1F2F6",
    padding: 10,
    paddingHorizontal: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#1E319D",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 30,
    alignItems: "center",
    elevation: 2,
  },
  buttonText3: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonText: {
    fontSize: 16,
    color: "#1E319D",
  },
  buttonText2: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  inputDesc: {
    backgroundColor: "#F1F2F6",
    width: "95%",
    height: 150,
    maxHeight: 300,
    paddingLeft: 10,
    paddingTop: 10,
    borderColor: "grey",
    borderRadius: 10,
    justifyContent: "flex-start",
    color: "black",
    textAlignVertical: "top",
  },
});
