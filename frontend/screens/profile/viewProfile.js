import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableHighlight,
} from "react-native";
import axios from "axios";
import config from "../config";
import ImageViewer from "../custom/ImageViewer";
import { TouchableOpacity } from "react-native";
import Spinner from "../custom/Spinner";
import Ionicons from "react-native-vector-icons/Ionicons";
import FeedPosts from "../post/feedPosts";
import jwtDecode from "jwt-decode";
import { capitalizeWords, getTimeDifference2 } from "../fn";
import { MaterialIcons } from "@expo/vector-icons";

export default ViewProfile = ({ route, navigation }) => {
  const token = useSelector((state) => state.token);

  const { userid } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState("");

  const current_userid = jwtDecode(token).userid;

  const [data, setData] = useState([]);
  const [feedsData, setFeedsData] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFeeds, setLoadingFeeds] = useState(false);

  const [userInfo, setUserInfo] = useState("");

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.API_URL}/api/users/${userid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      setUserInfo(response.data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPost();
    getFeedPost();
  }, []);

  const getPost = async () => {
    //certifcates
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

  const [hasMoreDataFeeds, setHasMoreDataFeeds] = useState(true);
  const [page, setPage] = useState(1);

  const getFeedPost = async () => {
    try {
      setLoadingFeeds(true);
      const res = await axios.get(
        `${config.API_URL}/api/${userid}/post-feeds/?page=1&pageSize=5`
      );
      if (res.data.length > 0) {
        setFeedsData(res.data);
        setPage(2);
      } else {
        setHasMoreDataFeeds(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFeeds(false);
    }
  };

  const loadMorePosts = async () => {
    //feed
    if (loadingFeeds || !hasMoreDataFeeds) {
      return;
    }
    setLoadingFeeds(true);
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
      setLoadingFeeds(false);
    }
  };

  const handleImageClick = () => {
    setModalVisible(true);
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
          marginBottom: 5,
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
            size={30}
            style={{ position: "absolute", bottom: 15, right: 15 }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  function UserInformation({ userInfo, current_userid }) {
    return (
      <View>
        {userInfo && (
          <>
            <View
              style={{
                backgroundColor: "#fff",
                padding: 10,
                margin: 20,
                paddingVertical: 20,
                borderRadius: 20,
                elevation: 2,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    userInfo.imageurl &&
                      setImageUri(`${config.API_URL}/${userInfo.imageurl}`);
                    handleImageClick();
                  }}
                  activeOpacity={1}
                >
                  {/* profile image */}

                  {userInfo.imageurl.length > 0 ? (
                    <Image
                      source={{ uri: `${config.API_URL}/${userInfo.imageurl}` }}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        borderColor: "lightgrey",
                        borderWidth: 1,
                      }}
                    />
                  ) : (
                    <Image
                      source={require("../../assets/images/default.png")}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        borderColor: "lightgrey",
                        borderWidth: 1,
                        marginTop: 20,
                      }}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* user name employee and bio */}
              <View style={{ flexDirection: "column" }}>
                <View style={{ flexDirection: "row", justifyContent:'center' }}>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 20,
                      marginVertical: 5,
                      fontWeight: "bold",
                    }}
                  >
                    {capitalizeWords(userInfo.name)}
                  </Text>
                  {userInfo.verification_status == "verified" && (
                    <Text
                      style={{
                        marginLeft: 5,
                        color: "grey",
                        fontSize: 12,
                        textAlignVertical: "center",
                      }}
                    >
                      <MaterialIcons name="verified" color="blue" size={16} />
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 14,
                    marginLeft: 15,
                    color: "grey",
                    marginVertical: 5,
                  }}
                >
                  {userInfo.email}
                </Text>
                <Text
                  style={{
                    color: "grey",
                    fontSize: 12,
                    textAlign: "center",
                    marginVertical: 5,
                  }}
                >
                  Joined ~ {getTimeDifference2(userInfo.created_on)}
                </Text>
              </View>

              {userInfo &&
                userid !== current_userid && ( //userinfo cards
                  <View
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-around",
                    }}
                  >
                    <TouchableHighlight
                      style={{
                        backgroundColor: "#F1F2F6",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        borderColor: "grey",
                        borderWidth: 0.25,
                        borderRadius: 15,
                        flex: 0.6,
                        margin: 10,
                      }}
                      underlayColor="#F1F2F6"
                      onPress={() => {
                        navigation.navigate("ChatRoom", {
                          touserid: userInfo.id,
                          imageurl: userInfo.imageurl,
                          title: capitalizeWords(userInfo.name),
                        });
                      }}
                    >
                      <Text style={{ marginLeft: 10, textAlign: "center" }}>
                        Message
                      </Text>
                    </TouchableHighlight>
                  </View>
                )}
            </View>

            {/* bio */}
            <TouchableOpacity
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: "#7E8CA7",
                padding: 15,
                marginHorizontal: 15,
                borderRadius: 10,
                elevation: 2,
              }}
              activeOpacity={1}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                {userInfo.bio ? userInfo.bio : "No Bio."}
              </Text>
            </TouchableOpacity>

            {userInfo.role === "em" && (
              <View
                style={{
                  justifyContent: "space-between",
                  marginTop: 20,
                  backgroundColor: "#fff",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    letterSpacing: 1,
                    padding: 10,
                    paddingLeft: 15,
                  }}
                >
                  Post
                </Text>
              </View>
            )}

            {userInfo.role === "js" && (
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  paddingHorizontal: 10,
                  justifyContent: "space-between",
                  marginTop: 20,
                  backgroundColor: "#fff",
                  flexDirection: "row",
                }}
              >
                <Text style={{ fontSize: 16, letterSpacing: 1, padding: 10 }}>
                  Certificates
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        elevation: 2,
      }}
    >
      <ImageViewer
        uri={imageUri}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />

      {/* show option to upload and display certificates if the usser is js */}
      {userInfo.role === "js" && (
        <FlatList
          ListHeaderComponent={
            <UserInformation
              userInfo={userInfo}
              current_userid={current_userid}
            />
          }
          data={data}
          ListEmptyComponent={() => {
            return (
              <View style={{ display: "flex", marginTop: 50 }}>
                <Text style={{ color: "grey", textAlign: "center" }}>
                  User have not uploaded any certificates.
                </Text>
              </View>
            );
          }}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          maxToRenderPerBatch={3}
        />
      )}
      {userInfo.role === "em" && (
        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <UserInformation
              userInfo={userInfo}
              current_userid={current_userid}
            />
          }
          data={feedsData}
          renderItem={({ item }) => (
            <FeedPosts
              item={item}
              role={userInfo.role}
              navigation={navigation}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          onEndReached={() => {
            if (!loadingFeeds && hasMoreDataFeeds) {
              loadMorePosts();
            }
          }}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            <>
              {loadingFeeds && (
                <ActivityIndicator size="small" color="#1E319D" />
              )}
            </>
          }
          ListEmptyComponent={() => {
            return (
              <Text
                style={{
                  textAlign: "center",
                  marginVertical: 30,
                  color: "grey",
                }}
              >
                No posts.
              </Text>
            );
          }}
        />
      )}
    </View>
  );
};
