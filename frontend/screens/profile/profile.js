import jwtDecode from "jwt-decode";
import { useSelector } from "react-redux";
import UserInfo from "./userInfo";
import { useState, useEffect } from "react";
import { FlatList, Text, View, ToastAndroid, Image, Alert } from "react-native";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import config from "../config";
import ImageViewer from "../custom/ImageViewer";
import { TouchableOpacity } from "react-native";
import Spinner from "../custom/Spinner";
import Ionicons from "react-native-vector-icons/Ionicons";
import AddCertificate from "./addCertificate";
import FeedPosts from "../post/feedPosts";

export default Profile = ({ navigation }) => {
  const token = useSelector((state) => state.token);
  const role = useSelector((state) => state.role);
  const userid = token ? jwtDecode(token).userid : null;

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState("");

  const [image, setImage] = useState(null);

  const [data, setData] = useState([]);
  const [feedsData, setFeedsData] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMoreDataFeeds, setHasMoreDataFeeds] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      if (role === "em") {
        getFeedPost();
      } else if (role === "js") {
        getPost();
      }
    }
    return () => {
      setData("");
    };
  }, [isFocused]);

  const getPost = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${config.API_URL}/api/${userid}/post-certificates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getFeedPost = async () => {
    try {
      setFeedLoading(true);
      const res = await axios.get(
        `${config.API_URL}/api/${userid}/post-feeds/?page=1&pageSize=5`
      );
      if (res.data.length > 0) {
        setPage(2);
        setFeedsData(res.data);
      } else {
        setHasMoreDataFeeds(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFeedLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (feedLoading || !hasMoreDataFeeds) {
      return;
    }

    setFeedLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}/api/${userid}/post-feeds/?page=${page}&pageSize=5`
      );
      if (res.data.length > 0) {
        setFeedsData((prevData) => [...prevData, ...res.data]);
        setPage(page + 1);
      } else {
        setHasMoreDataFeeds(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFeedLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("userid", userid);
      formData.append("image", {
        uri: image,
        name: "image.png",
        type: "image/png",
      });

      await axios.patch(`${config.API_URL}/api/users/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImage(null);
      ToastAndroid.show("Updated.", ToastAndroid.SHORT);
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageClick = () => {
    setModalVisible(true);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setIsModalVisible(false);
    });

    return unsubscribe;
  }, [navigation]);

  const handleDelete = (postid) => {
    Alert.alert(
      "Do you want to delete the post?",
      "Once deleted, you can not undo it.",
      [
        {
          text: "Delete",
          onPress: () => {
            axios
              .delete(`${config.API_URL}/api/post-certificates/${postid}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              .then((res) => {
                ToastAndroid.show("Deleted.", ToastAndroid.SHORT);
                getPost();
              })
              .catch((e) => {
                console.log(e.response.data);
              });
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

  if (loading) return <Spinner />;

  // // Render each item of the data array //posts //cetificates
  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          padding: 10,
          borderRadius: 0,
          flex: 1,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setImageUri(`${config.API_URL}/${item.images[0]}`);
            handleImageClick();
          }}
          activeOpacity={1}
        >
          <Image
            source={{ uri: `${config.API_URL}/${item.images}` }}
            style={{
              width: "100%",
              height: 250,
              borderRadius: 5,
              borderColor: "lightgrey",
              borderWidth: 0.5,
            }}
            resizeMode="cover"
          />
          <Ionicons
            name="expand-outline"
            color="lightgrey"
            size={20}
            style={{ position: "absolute", bottom: 15, right: 15 }}
          />
          <Ionicons
            name="trash"
            color="lightgrey"
            size={20}
            style={{ position: "absolute", bottom: 15, left: 15 }}
            onPress={() => handleDelete(item.id)}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const keyExtractor = (item) => item.id.toString();

  return (
    <View
      style={{
        elevation: 2,
      }}
    >
      <AddCertificate
        isModalVisible={isModalVisible}
        userid={userid}
        setIsModalVisible={setIsModalVisible}
        getPost={getPost}
      />

      <ImageViewer
        uri={imageUri}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />

      {/* image upload save // cancel btn  */}
      {image && (
        <View
          style={{
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "row",
            paddingVertical: 15,
            justifyContent: "space-around",
            borderColor: "grey",
            borderWidth: 0.25,
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => setImage(null)}>
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1} onPress={handleUpload}>
            <Text style={{ color: "#1E319D", fontWeight: "bold" }}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* show option to upload and display certificates if the usser is js */}
      {role === "js" && (
        <FlatList
          ListHeaderComponent={() => (
            <UserInfo
              userid={userid}
              navigation={navigation}
              image={image}
              setImage={setImage}
              handleUpload={handleUpload}
              role={role}
              setIsModalVisible={setIsModalVisible}
            />
          )}
          data={data}
          ListEmptyComponent={() => {
            return (
              <View style={{ display: "flex" }}>
                <Image
                  style={{ width: 400, height: 200, alignSelf: "center" }}
                  source={require("../../assets/images/certificate.png")}
                />
                <Text
                  style={{ textAlign: "center", color: "grey", marginTop: 30 }}
                >
                  Add certificates, stand out from competition{" "}
                </Text>
              </View>
            );
          }}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
        />
      )}
      {role === "em" && (
        <FlatList
          ListHeaderComponent={() => (
            <UserInfo
              userid={userid}
              navigation={navigation}
              image={image}
              setImage={setImage}
              handleUpload={handleUpload}
              role={role}
              setIsModalVisible={setIsModalVisible}
            />
          )}
          data={feedsData}
          renderItem={({ item }) => (
            <FeedPosts
              item={item}
              role={role}
              navigation={navigation}
              getFeedPost={getFeedPost}
            />
          )}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          onEndReachedThreshold={0.1}
          onEndReached={() => {
            if (!feedLoading && hasMoreDataFeeds) {
              loadMorePosts();
            }
          }}
          ListEmptyComponent={() => {
            return (
              <View style={{ display: "flex", marginTop: 30 }}>
                <Text style={{ textAlign: "center", color: "grey" }}>
                  No Post
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};
