import {
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableHighlight,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  TextInput,
} from "react-native";
import axios from "axios";
import config from "../config";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import jwtDecode from "jwt-decode";

export default Bio = ({
  isModalVisible,
  setIsModalVisible,
  fetchUserInfo,
  desc,
  setDesc,
}) => {
  //current user role

  const token = useSelector((state) => state.token);
  const userid = jwtDecode(token).userid;

  const handleBioChange = (text) => {
    if (text.length <= 200) {
      setDesc(text);
    }
  };

  const handlePost = async () => {
    try {
      const res = await axios.patch(
        `${config.API_URL}/api/users/${userid}/bio`,
        { bio: desc },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.updated) {
        fetchUserInfo();
        setDesc("");
        ToastAndroid.show("Updated", ToastAndroid.SHORT);
        setIsModalVisible(false);
      }

      console.log("Updated");
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
                  padding: 15,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "45%",
                }}
              >
                {/* top close header and next/ post btn */}
                <View style={styles.buttonContainer2}>
                  <View />
                  <Text style={styles.buttonText2}>Set Bio</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsModalVisible(false);
                    }}
                  >
                    <MaterialIcons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>

                <View style={styles.container}>
                  {/* desc */}
                  <TextInput
                    placeholder="Write here..."
                    style={styles.inputDesc}
                    multiline={true}
                    value={desc}
                    onChangeText={(text) => {
                      handleBioChange(text);
                      setDesc(text);
                    }}
                    maxLength={200}
                    blurOnSubmit={true}
                  />
                  <Text style={{ color: "grey", fontSize: 12 }}>
                    {desc.length}/200
                  </Text>
                  {desc.trim() !== "" && (
                    <TouchableHighlight
                      style={styles.button}
                      onPress={handlePost}
                      underlayColor="#1E319D"
                    >
                      <Text style={styles.buttonText3}>Set</Text>
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
