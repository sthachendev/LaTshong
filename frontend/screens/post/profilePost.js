import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  TouchableHighlight,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import config from "../config";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

export default ProfilePost = ({ navigation, route }) => {
  const { userid } = route.params;

  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
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
      formData.append("description", desc);
      formData.append("postby", userid);
      formData.append("image", {
        uri: image,
        name: "image.jpg",
        type: "image/jpg",
      });

      await axios.patch(`${config.API_URL}/api/post`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setDesc("");
      setImage(null);
      handleGoBack();
      ToastAndroid.show("Posted.", ToastAndroid.SHORT);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* top close header and next/ post btn */}
      <View style={styles.buttonContainer2}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialIcons name="close" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={1}>
          <Text style={styles.buttonText2}>Add Certificate</Text>
        </TouchableOpacity>

        <TouchableOpacity />
      </View>

      <View style={styles.container}>
        {/* desc */}
        <View style={styles.textContainer}>
          <TextInput
            placeholder="Write here..."
            style={styles.inputDesc}
            multiline={true}
            value={desc}
            onChangeText={setDesc}
          />
        </View>
        <Text
          style={{
            color: "grey",
            fontSize: 14,
            paddingLeft: 10,
            paddingTop: 5,
          }}
        >
          Text Limit
        </Text>

        <View style={{ flex: 1, alignItems: "center" }}>
          {image && (
            <Image
              source={{ uri: image }}
              style={{
                width: "95%",
                height: 200,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: "lightgrey",
                marginTop: 25,
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
              marginTop: 20,
              borderWidth: 0.5,
              borderColor: "grey",
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "grey" }}>Upload Certificate</Text>
          </TouchableOpacity>

          <TouchableHighlight
            style={styles.button}
            onPress={handlePost}
            underlayColor="#1E319D"
          >
            <Text style={styles.buttonText3}>Add</Text>
          </TouchableHighlight>
        </View>
      </View>
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
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "lightgrey",
    padding: 10,
    paddingHorizontal: 15,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 5,
  },
  button: {
    width: "100%",
    backgroundColor: "#1E319D",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 50,
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
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
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
