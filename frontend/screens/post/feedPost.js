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
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import axios from "axios";
import config from "../config";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Video } from "expo-av";
import ImageViewer from "../custom/ImageViewer";
import Ionicons from "react-native-vector-icons/Ionicons";

export default FeedPost = ({
  isModalVisible,
  setIsModalVisible,
  userid,
  getFeedPost,
}) => {
  const [media, setMedia] = useState(null);
  const [desc, setDesc] = useState("");

  const [modalVisible, setModalVisible] = useState(false); //image viewer

  const [isPosting, setIsPosting] = useState(false);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
      });

      if (result.type === "success") {
        setMedia(result);
      } else if (result.type === "cancel") {
        console.log("Document picking canceled.");
      }
    } catch (error) {
      console.log("Error while picking a document:", error);
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
      });

      if (result.type === "success") {
        setMedia(result);
      } else if (result.type === "cancel") {
        console.log("Document picking canceled.");
      }
    } catch (error) {
      console.log("Error while picking a document:", error);
    }
  };

  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePost = async () => {
    try {
      setIsPosting(true);
      const formData = new FormData();
      formData.append("postby", userid);
      formData.append("_desc", desc);

      if (media.mimeType.startsWith("video/")) {
        formData.append("media_type", "v");
      } else if (media.mimeType.startsWith("image/")) {
        formData.append("media_type", "i");
      }

      formData.append("image", {
        uri: media.uri,
        name: media.name,
        type: media.mimeType,
      });

      await axios.patch(`${config.API_URL}/api/post-feeds`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });
      getFeedPost();
      setMedia(null);
      setDesc("");
      ToastAndroid.show("Posted.", ToastAndroid.SHORT);
      setIsModalVisible(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsPosting(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <Modal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.9)",
              height: "100%",
              elevation: 2,
            }}
          >
            {isPosting && (
              <Modal transparent={true}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                  }}
                >
                  <ActivityIndicator size="large" color="#0000ff" />
                  <Text>Uploading: {uploadProgress}%</Text>
                </View>
              </Modal>
            )}
            {media && media.mimeType.startsWith("image/") && (
              <ImageViewer
                uri={media.uri}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
              />
            )}

            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 15,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: media ? "80%" : "70%",
                }}
              >
                {/* top close header and next/ post btn */}
                <View style={styles.buttonContainer2}>
                  <View />
                  <Text style={styles.buttonText2}>New Feed Post</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsModalVisible(false);
                      setMedia("");
                    }}
                  >
                    <MaterialIcons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>

                <View style={styles.container}>
                  <TextInput
                    placeholder="Write here..."
                    style={styles.inputDesc}
                    multiline={true}
                    value={desc}
                    onChangeText={setDesc}
                    blurOnSubmit={true}
                  />

                  {media && media.mimeType.startsWith("image/") && (
                    <>
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setModalVisible(true)}
                      >
                        <Image
                          source={{ uri: media.uri }}
                          style={{
                            width: "100%",
                            height: 200,
                            borderWidth: 1,
                            borderRadius: 5,
                            borderColor: "lightgrey",
                            marginTop: 30,
                          }}
                        />
                        <Ionicons
                          name="expand-outline"
                          color="lightgrey"
                          size={20}
                          style={{
                            position: "absolute",
                            bottom: 15,
                            right: 15,
                          }}
                        />
                      </TouchableOpacity>
                    </>
                  )}

                  {media && media.mimeType.startsWith("video/") && (
                    <Video
                      source={{ uri: media.uri }}
                      style={{
                        width: "100%",
                        height: 200,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: "lightgrey",
                        marginTop: 30,
                      }}
                      useNativeControls
                      resizeMode="contain"
                    />
                  )}

                  <View style={{ display: "flex", flexDirection: "row" }}>
                    <TouchableOpacity
                      onPress={pickImage}
                      style={styles.mediaBtn}
                      activeOpacity={0.7}
                    >
                      <Icon name="image" size={24} color="#000" />
                      <Text style={{ color: "grey", marginLeft: 20 }}>
                        Add Photo
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={pickVideo}
                      style={styles.mediaBtn}
                      activeOpacity={0.7}
                    >
                      <Icon name="videocam" size={24} color="#000" />
                      <Text style={{ color: "grey", marginLeft: 20 }}>
                        Add Video
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {media && (
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
    width: "100%",
    height: 150,
    maxHeight: 300,
    paddingLeft: 10,
    paddingTop: 10,
    borderColor: "grey",
    borderRadius: 5,
    justifyContent: "flex-start",
    color: "black",
    textAlignVertical: "top",
    marginTop: 30,
  },
  mediaBtn: {
    backgroundColor: "#fff",
    padding: 10,
    paddingHorizontal: 15,
    marginTop: 30,
    borderWidth: 0.5,
    borderColor: "grey",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
});
