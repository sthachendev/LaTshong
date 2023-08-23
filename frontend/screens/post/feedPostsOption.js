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
} from "react-native";
import axios from "axios";
import config from "../config";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import jwtDecode from "jwt-decode";

export default FeedPostsOption = ({
  isModalVisible,
  setIsModalVisible,
  postby,
  postid,
  getFeedPost,
}) => {
  const token = useSelector((state) => state.token);
  const userid = token ? jwtDecode(token).userid : null;

  const handleReport = async () => {
    try {
      const res = await axios.put(
        `${config.API_URL}/api/post-feeds/${postid}/report/${userid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        ToastAndroid.show("Reported", ToastAndroid.SHORT);
        setIsModalVisible(false);
      }
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const handleDelete = () => {
    axios
      .delete(`${config.API_URL}/api/post-feeds/${postid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        ToastAndroid.show("Deleted", ToastAndroid.SHORT);
        setIsModalVisible(false);
        getFeedPost();
      })
      .catch((e) => {
        console.log(e.response.data);
      });
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
              backgroundColor: "rgba(0,0,0,0.5)",
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
                  height: "20%",
                }}
              >
                <TouchableOpacity
                  style={styles.buttonContainer2}
                  onPress={() => {
                    setIsModalVisible(false);
                  }}
                ></TouchableOpacity>

                <View style={styles.container}>
                  {postby == userid ? (
                    <TouchableHighlight
                      style={styles.btn}
                      underlayColor="#F1F2F6"
                      onPress={handleDelete}
                    >
                      <>
                        <Icon
                          name="delete"
                          size={20}
                          color="rgba(30,49,157,0.7)"
                          style={{}}
                        />
                        <Text
                          style={{
                            paddingHorizontal: 5,
                            color: "rgba(30,49,157,0.7)",
                          }}
                        >
                          Delete post
                        </Text>
                      </>
                    </TouchableHighlight>
                  ) : (
                    <TouchableHighlight
                      style={styles.btn}
                      underlayColor="#F1F2F6"
                      onPress={handleReport}
                    >
                      <>
                        <Icon
                          name="flag"
                          size={20}
                          color="rgba(30,49,157,0.7)"
                          style={{}}
                        />
                        <Text
                          style={{
                            paddingHorizontal: 5,
                            color: "rgba(30,49,157,0.7)",
                          }}
                        >
                          Flag as Inappropriate
                        </Text>
                      </>
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
    justifyContent: "center",
    alignContent: "center",
  },
  buttonContainer2: {
    backgroundColor: "lightgrey",
    padding: 5,
    paddingHorizontal: 15,
    width: "15%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 10,
  },
  btn: {
    backgroundColor: "#fff",
    marginVertical: 15,
    flexDirection: "row",
    padding: 15,
  },
  buttonText2: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
