import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Dimensions,ToastAndroid 
} from "react-native";
import { capitalizeWords, getTimeDifference } from "../fn/fn";
import Icon from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import { firebase } from "../../firebase/config";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Loading from "../post/loading";

export default function ReportDetails({ route }) {
  const { postId } = route.params;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageContainerRef = useRef(null);

  const [fetchComments, setFetchComments] = useState(null);

  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);

  const [commentWidth, setCommentWidth] = useState(null);

  const navigation = useNavigation();

  const fetchPost = async () => {
    try {
      const postRef = firebase.firestore().collection("posts").doc(postId);
      const postSnapshot = await postRef.get();

      if (postSnapshot.exists) {
        const postData = postSnapshot.data();
        setPost(postData);

        const userRef = firebase
          .firestore()
          .collection("users")
          .doc(postData.postBy);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          setUser(userData);
        } else {
          console.log("User not found");
        }
      } else {
        console.log("Post not found");
      }
    } catch (error) {
      console.error("Error fetching post and user:", error);
    }
  };

  const fetchCommentsForPost = async () => {
    try {
      const commentsRef = firebase.firestore().collection("comments");
      const query = commentsRef.where("postId", "==", postId);
      const querySnapshot = await query.get();

      const fetchedComments = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const commentData = doc.data();
          const userRef = firebase
            .firestore()
            .collection("users")
            .doc(commentData.commentBy);
          const userDoc = await userRef.get();
          const userData = userDoc.data();

          const commentWithUserData = {
            ...commentData,
            userName: userData.firstName + " " + userData.lastName,
            profileImageUrl: userData.profileImageUrl,
          };

          return commentWithUserData;
        })
      );

      const sortedComments = fetchedComments.sort(
        (a, b) => a.timestamp - b.timestamp
      );
      setFetchComments(sortedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchCommentsForPost();
    fetchPost();
  }, [postId]);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      return prevIndex + 1;
    });
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex > 0) {
        return prevIndex - 1;
      }
      return prevIndex;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          handlePreviousImage();
        } else if (gestureState.dx < -50) {
          handleNextImage();
        }
      },
    })
  ).current;

  const handleWithdraw = async () => {
    try {
      const postRef = firebase.firestore().collection("posts").doc(postId);
      await postRef.update({
        reportedBy: [],
      });
      setPost((prevPost) => ({
        ...prevPost,
        reportedBy: [],
      }));
      ToastAndroid.show('Post report withdrawn', ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error withdrawing post:", error);
    }
  };

  const handleSuspend = async () => {
    try {
      const userRef = firebase.firestore().collection("users").doc(post.postBy);
      await userRef.update({
        isSuspended: true,
      });
      setUser((prevUser) => ({
        ...prevUser,
        isSuspend: true,
      }));
      ToastAndroid.show('User suspended', ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error suspending user:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const postRef = firebase.firestore().collection("posts").doc(postId);
      await postRef.delete();
      ToastAndroid.show('Post deleted', ToastAndroid.SHORT);
      navigation.goBack(); // or navigate to a different screen after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (!post || !user) {
    return <Loading />;
  }

  const UserProfileImage = ({ image }) => {
    return (
      <View style={{ margin: 10 }}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 50, height: 50, borderRadius: 50 }}
          />
        ) : (
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 50,
              backgroundColor: "black",
            }}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={{ backgroundColor: "white" }}>
          <View
            style={styles.imageContainer}
            ref={imageContainerRef}
            {...panResponder.panHandlers}
          >
            <Image
              source={{
                uri: post.assets[
                  Math.min(currentImageIndex, post.assets.length - 1)
                ],
              }}
              style={{ flex: 1, aspectRatio: 1 }}
              resizeMode="center"
            />
          </View>

          <View style={styles.userInfoContainer}>
            <UserProfileImage image={post.profileImageUrl} />
            <View style={{ marginTop: 10 }}>
              <View>
                <Text>
                  <Text style={{ fontWeight: "500" }}>
                    {capitalizeWords(post.userName)}
                  </Text>
                  <Text style={{ color: "grey" }}>
                    {" "}
                    · {post.postByEmail}
                  </Text>
                </Text>
              </View>
              <View style={{ marginTop: 5 }}>
                <Text style={{ color: "grey" }}>
                  {getTimeDifference(post.postDate)}
                </Text>
              </View>
            </View>
          </View>

          {post.description && (
            <View style={styles.descriptionContainer}>
              <Text>{post.description}</Text>
            </View>
          )}
        </View>

        <View style={styles.commentsContainer}>
          {fetchComments &&
            fetchComments.map((comment, index) => (
              <View
                key={index}
                style={styles.commentContainer}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  const halfScreenWidth =
                    Dimensions.get("window").width / 2;
                  const dynamicWidth = Math.min(width, halfScreenWidth);
                  setCommentWidth(dynamicWidth);
                }}
              >
                <Image
                  source={{ uri: comment.profileImageUrl }}
                  style={styles.commentProfileImage}
                />

                <View style={styles.commentContentContainer}>
                  <Text style={styles.commentUserName}>
                    {capitalizeWords(comment.userName)}
                    <Text style={styles.commentDate}>
                      {" · " + getTimeDifference(comment.commentDate)}
                    </Text>
                  </Text>
                  <Text>{comment.comment}</Text>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={[styles.button, { backgroundColor: "lightgrey" }]}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDelete}
          style={[styles.button, { backgroundColor: "#FF5A5F" }]}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSuspend}
          style={[styles.button, { backgroundColor: "#FF5A5F" }]}
        >
          <Text style={styles.buttonText}>Suspend</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleWithdraw}
          style={[styles.button, { backgroundColor: "#6AB187" }]}
        >
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F6F8",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 400,
    backgroundColor: "black",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  descriptionContainer: {
    padding: 10,
  },
  commentsContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#CDD2D4",
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  commentProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 50,
    marginRight: 10,
  },
  commentContentContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CDD2D4",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
  },
  commentUserName: {
    fontWeight: "500",
  },
  commentDate: {
    color: "grey",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#CDD2D4",
    backgroundColor: "white",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
});
