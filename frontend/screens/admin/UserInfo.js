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
  Alert,
} from "react-native";
import axios from "axios";
import config from "../config";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { getTimeDifference } from "../fn";
import { TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

export default UserInfo = ({
  isModalVisible,
  setIsModalVisible,
  user,
  setUser,
  fetchUserData,
}) => {
  const token = useSelector((state) => state.token);

  const handleDelete = (userid) => {
    Alert.alert(
      "Do you want to delete the user?",
      "User will be permanently deleted.",
      [
        {
          text: "Delete",
          onPress: () => {
            deleteUser(userid);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleVerification = (userid) => {
    Alert.alert(
      "Do you want to set user as verified user?",
      "Account will be a verified account.",
      [
        {
          text: "Verify",
          onPress: () => {
            verifyUser(userid);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const verifyUser = async (userid) => {
    try {
      const res = await axios.patch(
        `${config.API_URL}/api/users/${userid}/verify-account`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log(res.status)
      if (res.status == 200) {
        ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        setStatus(res.data.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (userid) => {
    try {
      const res = await axios.delete(`${config.API_URL}/api/users/${userid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.status);
      if (res.status == 200) {
        fetchUserData();
        setIsModalVisible(false);
        ToastAndroid.show("User Deleted", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState(user.verification_status);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (name !== user.name) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [name, user.name]);

  useEffect(() => {
    setName(user.name);
    setStatus(user.verification_status);
  }, [user.name]);

  const updateUserField = (userid, field, value, token) => {
    axios
      .put(
        `${config.API_URL}/api/users/${field}/${userid}`,
        { [field]: value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        setUser((prevUser) => ({ ...prevUser, [field]: value }));
        ToastAndroid.show("Updated", ToastAndroid.SHORT);
      })
      .catch((e) => console.log(e));
  };

  const handleSave = (userid) => {
    if (name !== user.name) {
      updateUserField(userid, "name", name, token);
    }
  };

  const handleRevertVerification = (userid) => {
    Alert.alert(
      "Do you want revert account verification?",
      "Account will not be a verified account.",
      [
        {
          text: "Revert",
          onPress: () => {
            revertVeriedUser(userid);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const revertVeriedUser = async (userid) => {
    console.log("token", token);
    try {
      const res = await axios.patch(
        `${config.API_URL}/api/users/${userid}/revert-verification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.status);
      if (res.status == 200) {
        ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        setStatus(res.data.status);
      }
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
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 15,
                  paddingTop: 0,
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "100%",
                }}
              >
                <View style={styles.buttonContainer2}>
                  <View />
                  <Text style={styles.buttonText2}>User Information</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsModalVisible(false);
                      fetchUserData();
                    }}
                  >
                    <MaterialIcons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>

                {isChanged && (
                  <View
                    style={{
                      backgroundColor: "#fff",
                      display: "flex",
                      flexDirection: "row",
                      paddingVertical: 15,
                      justifyContent: "space-around",
                      borderBottomColor: "lightgrey",
                      borderBottomWidth: 1,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        setName(user.name);
                      }}
                    >
                      <Text>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => handleSave(user.id)}
                    >
                      <Text style={{ color: "#1E319D", fontWeight: "bold" }}>
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <ScrollView
                  style={styles.container}
                  showsVerticalScrollIndicator={false}
                >
                  <View
                    style={{ alignItems: "center", padding: 15, marginTop: 10 }}
                  >
                    {user.imageurl && user.imageurl.length > 0 ? (
                      <Image
                        source={{ uri: `${config.API_URL}/${user.imageurl}` }}
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 50,
                          borderColor: "lightgrey",
                          borderWidth: 1,
                        }}
                      />
                    ) : (
                      <Image
                        source={require("../../assets/images/default.png")}
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 50,
                          borderColor: "lightgrey",
                          borderWidth: 1,
                        }}
                      />
                    )}
                  </View>

                  <TextInput
                    mode="outlined"
                    label="Account Status"
                    value={status}
                    style={{ fontSize: 14, marginTop: 5 }}
                    theme={{
                      colors: {
                        primary: "#4942E4",
                        background: "#fff",
                        outline: "lightgrey",
                      },
                    }}
                    multiline={true}
                    blurOnSubmit={true}
                    disabled
                  />

                  <TextInput
                    mode="outlined"
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    style={{ fontSize: 14, marginTop: 20 }}
                    theme={{
                      colors: {
                        primary: "#4942E4",
                        background: "#fff",
                        outline: "lightgrey",
                      },
                    }}
                    multiline={true}
                    blurOnSubmit={true}
                  />
                  <TextInput
                    mode="outlined"
                    label="Email"
                    value={user.email}
                    style={{ fontSize: 14, marginTop: 20 }}
                    theme={{
                      colors: {
                        primary: "#4942E4",
                        background: "#fff",
                        outline: "lightgrey",
                      },
                    }}
                    multiline={true}
                    blurOnSubmit={true}
                    pointerEvents="none"
                    disabled
                  />
                  <TextInput
                    mode="outlined"
                    label="Role"
                    value={
                      user.role === "js"
                        ? "Job Seeker"
                        : user.role === "em"
                        ? "Employer"
                        : ""
                    }
                    style={{ fontSize: 14, marginTop: 20 }}
                    theme={{
                      colors: {
                        primary: "#4942E4",
                        background: "#fff",
                        outline: "lightgrey",
                      },
                    }}
                    multiline={true}
                    blurOnSubmit={true}
                    pointerEvents="none"
                    disabled
                  />
                  <TextInput
                    mode="outlined"
                    label="Joined"
                    value={getTimeDifference(user.created_on)}
                    style={{ fontSize: 14, marginTop: 20 }}
                    theme={{
                      colors: {
                        primary: "#4942E4",
                        background: "#fff",
                        outline: "lightgrey",
                      },
                    }}
                    multiline={true}
                    blurOnSubmit={true}
                    pointerEvents="none"
                    disabled
                  />

                  <TextInput
                    mode="outlined"
                    label="Bio"
                    value={user.bio ? user.bio : "No Bio"}
                    style={{ fontSize: 14, marginVertical: 20 }}
                    theme={{
                      colors: {
                        primary: "#4942E4",
                        background: "#fff",
                        outline: "lightgrey",
                      },
                    }}
                    multiline={true}
                    blurOnSubmit={true}
                    pointerEvents="none"
                    disabled
                  />

                  <TouchableHighlight
                    style={{
                      backgroundColor: "#fff",
                      borderColor: "rgba(30, 49, 157, 0.7)",
                      borderWidth: 0.25,
                      marginVertical: 10,
                      width: "100%",
                      borderRadius: 25,
                    }}
                    underlayColor="rgba(30, 49, 157, 0.1)"
                    onPress={() => {
                      if (status !== "verified") {
                        handleVerification(user.id);
                      } else {
                        handleRevertVerification(user.id);
                      }
                    }}
                  >
                    <Text
                      style={{
                        paddingVertical: 10,
                        textAlign: "center",
                        color: "rgba(30, 49, 157, 0.7)",
                      }}
                    >
                      {status !== "verified"
                        ? "Verify Account"
                        : "Revert Account Verification"}
                    </Text>
                  </TouchableHighlight>

                  <TouchableHighlight
                    style={{
                      backgroundColor: "#fff",
                      borderColor: "rgba(255, 0, 0, 0.7)",
                      marginVertical: 10,
                      width: "100%",
                      borderWidth: 0.25,
                      borderRadius: 25,
                    }}
                    underlayColor="rgba(255, 0, 0, 0.1)"
                    onPress={() => handleDelete(user.id)}
                  >
                    <Text
                      style={{
                        paddingVertical: 10,
                        textAlign: "center",
                        color: "rgba(255, 0, 0, 0.7)",
                      }}
                    >
                      Delete Account
                    </Text>
                  </TouchableHighlight>
                </ScrollView>
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
