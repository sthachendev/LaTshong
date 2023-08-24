import { View, Text, StyleSheet, Image } from "react-native";
import { capitalizeFirstLetterOfParagraphs, getTimeDifference2 } from "../fn";
import { memo } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import config from "../config";
// import { Video } from "expo-av";
import { capitalizeWords } from "../fn";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import FeedPostsOption from "./feedPostsOption";
import ImageViewer from "../custom/ImageViewer";
import Ionicons from "react-native-vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";
// import VideoPlayer from "../custom/VideoPlayer";
import { ResizeMode } from 'expo-av'
import VideoPlayer from 'expo-video-player'
import { useIsFocused } from "@react-navigation/native";

const FeedPosts = ({ item, role, navigation, getFeedPost }) => {
  const [isModalVisible2, setIsModalVisible2] = useState(false); //bio set modal

  const [modalVisible, setModalVisible] = useState(false); //image viewer

  const [inFullscreen, setInFullscreen] = useState(false);

  const handleFullscreenUpdate = (event) => {
    setInFullscreen(event.fullscreenUpdate === VideoPlayer.FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT);
  };

  const handleEnterFullscreen = () => {
    setInFullscreen(true);
  };

  const isFocused = useIsFocused();
  
  return (
    <View style={styles.itemContainer}>
      <ImageViewer
        uri={`${config.API_URL}/${item.media_uri}`}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />

      <FeedPostsOption
        isModalVisible={isModalVisible2}
        setIsModalVisible={setIsModalVisible2}
        postby={item.postby}
        postid={item.id}
        getFeedPost={getFeedPost}
      />

      <View style={{ paddingTop: 10 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingHorizontal: 15,
          }}
        >
          {item.imageurl.length > 0 ? (
            <Image
              source={{ uri: `${config.API_URL}/${item.imageurl}` }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 25,
                borderColor: "lightgrey",
                borderWidth: 1,
              }}
            />
          ) : (
            <Image
              source={require("../../assets/images/default.png")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 25,
                borderColor: "lightgrey",
                borderWidth: 1,
              }}
            />
          )}
          <View style={{ flex: 1 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                flex: 1,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                style={{ flexDirection: "row", paddingRight: 50 }}
                onPress={() => {
                  role
                    ? navigation.navigate("ViewProfile", {
                        userid: item.postby,
                      })
                    : navigation.navigate("Login");
                }}
              >
                <Text
                  style={{
                    marginLeft: 10,
                    textAlignVertical: "center",
                    fontWeight: "500",
                    marginRight: 5,
                    color: "#404040",
                    fontSize: 14,
                  }}
                  numberOfLines={1}
                >
                  {capitalizeWords(item.name)}
                </Text>
                {item.verification_status == "verified" && (
                  <Text
                    style={{
                      color: "grey",
                      fontSize: 12,
                      textAlignVertical: "center",
                    }}
                  >
                    <MaterialIcons name="verified" color="blue" size={16} />
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  role
                    ? setIsModalVisible2(true)
                    : navigation.navigate("Login");
                }}
              >
                <Icon name="more-vert" size={20} color="grey" />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: "grey",
                fontSize: 12,
                textAlignVertical: "center",
                marginLeft: 10,
              }}
            >
              {getTimeDifference2(item.postdate)}
            </Text>
          </View>
        </View>
        {item._desc && item._desc.trim() !== "" ? (
          <Text
            style={{
              color: "#404040",
              textAlign: "justify",
              marginVertical: 10,
              paddingHorizontal: 15,
            }}
          >
            {capitalizeFirstLetterOfParagraphs(item._desc)}
          </Text>
        ) : (
          <View style={{ marginTop: 10 }} />
        )}

        {item.media_type === "i" && ( // i image
          <>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={1}
            >
              <Image
                source={{ uri: `${config.API_URL}/${item.media_uri}` }}
                style={{ width: "100%", height: 250 }}
                resizeMode="cover"
              />
              <Ionicons
                name="expand-outline"
                color="lightgrey"
                size={20}
                style={{ position: "absolute", bottom: 15, right: 15 }}
              />
            </TouchableOpacity>
          </>
        )}

        {item.media_type === "v" && ( // v --video
          <>
          <VideoPlayer
            videoProps={{
              shouldPlay: isFocused,
              resizeMode: VideoPlayer.RESIZE_MODE_CONTAIN,
              resizeMode: ResizeMode.CONTAIN,
              source: {
                uri: `${config.API_URL}/${item.media_uri}`,
              },
            }}
              // style={{ width: "100%", height: 200 }}
              // onFullscreenUpdate={handleFullscreenUpdate}
              // fullscreen={inFullscreen}
              onFullscreenUpdate={handleFullscreenUpdate}
              fullscreen={true}
        // fullscreen={{
        //   enterFullscreen: handleEnterFullscreen,
        //   exitFullscreen: () => setInFullscreen(false),
        //   orientation: 'landscape',
        // }}
        style={{ height: 300 }}

/>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#fff",
    paddingBottom: 10,
  },
});

export default memo(FeedPosts);
