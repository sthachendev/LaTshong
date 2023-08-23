import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";
import Posts from "../post/posts";
import Spinner from "../custom/Spinner";
import { FAB } from "react-native-paper";
import ActionButton from "./actionButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import FeedPost from "../post/feedPost";
import jwtDecode from "jwt-decode";
import FeedPosts from "../post/feedPosts";

export default Home = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [refreshing, setRefreshing] = useState(false);

  const token = useSelector((state) => state.token);
  const role = useSelector((state) => state.role);
  const userid = token ? jwtDecode(token).userid : null;

  const [jobPost, setJobPosts] = useState("");
  const [feedsData, setFeedsData] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [JobPostPage, setJobPostPage] = useState(1);

  useEffect(() => {
    getJobPost();
    getFeedPost();

    return () => {
      setJobPosts("");
    };
  }, []);

  const getJobPost = async () => {
    try {
      if (role === "em") {
        setLoading(true);
        const res = await axios.get(
          `${config.API_URL}/api/${userid}/post-jobs`
        );
        setJobPosts(res.data);
        if (res.data) setLoading(false);
      } else {
        //fetch job posts post by all/ any em
        setLoading(true);
        const res = await axios.get(
          `${config.API_URL}/api/post-jobs/?page=1&pageSize=5`
        );
        setJobPosts(res.data);
        setJobPostPage(2);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [hasMoreDataJobPosts, setHasMoreDataJobPosts] = useState(true);

  const loadMoreJobPosts = async () => {
    if (loading || !hasMoreDataJobPosts) {
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `${config.API_URL}/api/post-jobs/?page=${JobPostPage}&pageSize=5`
      );
      if (res.data.length > 0) {
        setJobPosts((prevPosts) => [...prevPosts, ...res.data]);
        setJobPostPage(JobPostPage + 1);
      } else {
        setHasMoreDataJobPosts(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [hasMoreDataFeeds, setHasMoreDataFeeds] = useState(true);

  const getFeedPost = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${config.API_URL}/api/post-feeds/?page=1&pageSize=5`
      );
      if (res.data.length > 0) {
        setFeedsData(res.data);
        setPage(2);
      } else {
        setFeedsData([]);
        setHasMoreDataFeeds(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    //feed
    if (loading || !hasMoreDataFeeds) {
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}/api/post-feeds/?page=${page}&pageSize=5`
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
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setHasMoreDataJobPosts(true);
      setHasMoreDataFeeds(true);

      await getJobPost();
      await getFeedPost();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const flatListRef = useRef(null);

  const [scrollOffset, setScrollOffset] = useState(0);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollOffset(offsetY);
  };

  useEffect(() => {
    if (isFocused) {
      const loadScrollOffset = async () => {
        try {
          const lastScrollOffset = await AsyncStorage.getItem(
            "lastScrollOffsetHome"
          );
          if (flatListRef.current && lastScrollOffset) {
            flatListRef.current.scrollToOffset({
              offset: Number(lastScrollOffset),
              animated: false,
            });
          }
        } catch (error) {
          console.error("Error retrieving scroll offset:", error);
        }
      };

      loadScrollOffset();
    }
  }, [isFocused]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const lastScrollOffset = await AsyncStorage.getItem(
          "lastScrollOffsetHome"
        );
        if (flatListRef.current && lastScrollOffset) {
          flatListRef.current.scrollToOffset({
            offset: Number(lastScrollOffset),
            animated: false,
          });
        }
      } catch (error) {
        console.error("Error retrieving scroll offset:", error);
      }
    });

    navigation.addListener("blur", saveScrollOffset);

    return () => {
      saveScrollOffset();
      unsubscribe();
    };
  }, [navigation]);

  const saveScrollOffset = async () => {
    if (flatListRef.current) {
      const offsetY = flatListRef.current._listRef._scrollMetrics.offset;
      try {
        await AsyncStorage.setItem("lastScrollOffsetHome", String(offsetY));
      } catch (error) {
        console.error("Error saving scroll offset:", error);
      }
    }
  };

  const [selectedItem, setSelectedItem] = useState(null);
  const [jobTabSelected, setJobTabSelected] = useState(true);

  const [visible, setVisible] = useState(false);

  const handleMainButtonPress = () => {
    setVisible(!visible);
  };

  const [isModalVisible, setIsModalVisible] = useState(false); //feed post modal

  if (loading) {
    return <Spinner />;
  }

  return (
    <View style={styles.container}>
      <FeedPost
        isModalVisible={isModalVisible}
        userid={userid}
        setIsModalVisible={setIsModalVisible}
        getFeedPost={getFeedPost}
      />

      <View style={styles.topTabBtnContainer}>
        <TouchableOpacity
          style={[
            styles.topTabBtn,
            { borderBottomColor: jobTabSelected ? "#1E319D" : "#F1F2F6" },
          ]}
          onPress={() => setJobTabSelected(true)}
          activeOpacity={1}
        >
          <Icon
            name="work"
            size={24}
            color={jobTabSelected ? "#1E319D" : "grey"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.topTabBtn,
            { borderBottomColor: !jobTabSelected ? "#1E319D" : "#F1F2F6" },
          ]}
          onPress={() => setJobTabSelected(false)}
          activeOpacity={1}
        >
          <Icon
            name="article"
            size={24}
            color={!jobTabSelected ? "#1E319D" : "grey"}
          />
        </TouchableOpacity>
      </View>

      {
        //job posts
        jobTabSelected && (
          <FlatList
            ref={flatListRef}
            data={jobPost}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Posts
                item={item}
                role={role}
                navigation={navigation}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={() => {
              return (
                <Text
                  style={{
                    textAlign: "center",
                    marginVertical: 30,
                    color: "grey",
                  }}
                >
                  No posts
                </Text>
              );
            }}
            onEndReached={() => {
              if (!loading && hasMoreDataJobPosts) {
                loadMoreJobPosts();
              }
            }}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={
              <>
                {loading && <ActivityIndicator size="small" color="#1E319D" />}
              </>
            }
          />
        )
      }

      {
        //news feeds posts
        !jobTabSelected && (
          <FlatList
            ref={flatListRef}
            showsVerticalScrollIndicator={false}
            data={feedsData}
            renderItem={({ item }) => (
              <FeedPosts
                item={item}
                role={role}
                navigation={navigation}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                getFeedPost={getFeedPost}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => {
              return (
                <Text
                  style={{
                    textAlign: "center",
                    marginVertical: 30,
                    color: "grey",
                  }}
                >
                  No posts
                </Text>
              );
            }}
            onEndReached={() => {
              if (!loading && hasMoreDataFeeds) {
                loadMorePosts();
              }
            }}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={
              <>
                {loading && <ActivityIndicator size="small" color="#1E319D" />}
              </>
            }
          />
        )
      }

      {role === "em" && (
        <>
          <View style={styles.floatingBtnContainer}>
            <FAB
              style={{
                position: "absolute",
                bottom: 16,
                right: 15,
                backgroundColor: "#1E319D",
                borderRadius: 40,
              }}
              icon={visible ? "close" : "plus"}
              color="#fff"
              onPress={handleMainButtonPress}
            />
            <ActionButton
              visible={visible}
              onButton1Press={() => {
                navigation.navigate("Post");
                setVisible(false);
              }}
              onButton2Press={() => {
                setIsModalVisible(true);
                setVisible(false);
              }}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  floatingPost: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1E319D",
    borderRadius: 25,
    padding: 12,
    elevation: 4,
    shadowColor: "black",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  topTabBtnContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    backgroundColor: "#F1F2F6",
  },
  floatingBtnContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topTabBtn: {
    flexDirection: "row",
    borderBottomWidth: 3,
    flex: 1,
    padding: 10,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
