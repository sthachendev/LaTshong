import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import config from "../config";
import { useDispatch, useSelector } from "react-redux";
import jwtDecode from "jwt-decode";
import Icon from "react-native-vector-icons/Ionicons";
import { isToday, isSameDate, getTime, getFileSize } from "../fn";
import Header from "./chatRoomHeader";
import Spinner from "../custom/Spinner";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import ImageViewer from "../custom/ImageViewer";
import { ProgressBar } from "react-native-paper";
import * as Sharing from "expo-sharing";
const { StorageAccessFramework } = FileSystem;
import createSocket from "../socketConfig";
import { clearUnreadCount, setUnreadCount } from "../../reducers";

export default ChatRoom = ({ route, navigation }) => {
  const token = useSelector((state) => state.token);
  const userid = jwtDecode(token).userid;
  const { touserid, imageurl } = route.params;

  const [sending, setSending] = useState(false);

  const [fetchingMsg, setFetchingMsg] = useState(false);
  const [fetchMore, setFetchMore] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Header
          title={route.params.title}
          imageUrl={imageurl}
          touserid={touserid}
        />
      ),
    });
  }, [navigation, route.params.title, imageurl]);

  const [uploadProgress, setUploadProgress] = useState(0);

  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState("");
  const [roomId, setRoomId] = useState(null);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = createSocket(token);
    setSocket(socket);
    socket.emit("joinChat", { user1: userid, user2: touserid });

    socket.on("roomJoined", (data) => {
      const { roomId } = data;
      setRoomId(roomId);
      socket.emit("markRoomMessagesAsRead", { roomId, userid });
      socket.emit("UnReadMessage", { roomId, userid });
    });

    socket.on("UnReadMessageResult", (data) => {
      if (data > 0) {
        dispatch(setUnreadCount(true));
      } else {
        dispatch(clearUnreadCount());
      }
    });

    socket.on("fetchMessages", (data) => {
      const { messages } = data;
      setMessages(messages);
    });

    socket.on("messageAdded", (data) => {
      const {
        id,
        userid,
        roomId,
        message,
        message_type,
        date,
        file_name,
        file_size,
        file_uri,
        file_type,
      } = data;

      setMessages((prevMessages) => [
        {
          id,
          userid,
          roomId,
          message,
          message_type,
          date,
          file_name,
          file_size,
          file_uri,
          file_type,
        },
        ...prevMessages,
      ]);
    });

    socket.on("fetchOlderMessages", (data) => {
      setFetchingMsg(false);
      const { messages } = data;
      if (messages.length == 0) setFetchMore(false);
      messages.forEach((oldMessage) => {
        const {
          id,
          userid,
          roomId,
          message,
          message_type,
          date,
          file_name,
          file_size,
          file_uri,
          file_type,
        } = oldMessage;

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id,
            userid,
            roomId,
            message,
            message_type,
            date,
            file_name,
            file_size,
            file_uri,
            file_type,
          },
        ]);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (message) => {
    if (message && message.trim() !== "") {
      socket.emit("addMessage", { message, userid, roomId });
      setMessage("");
    } else if (file) {
      try {
        setSending(true);
        const formData = new FormData();
        formData.append("userid", userid);
        formData.append("roomId", roomId);
        formData.append("image", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        });

        axios
          .patch(`${config.API_URL}/api/chats/upload-attachement`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            },
          })
          .then((res) => {
            setUploadProgress(0);
            setSending(false);
          })
          .catch((e) => {
            console.log(e);
            setSending(true);
          });
      } catch (error) {
        console.log(error);
      } finally {
        setFile("");
      }
    }
  };

  const handleFetchMore = () => {
    if (fetchMore && messages[messages.length - 1].id) {
      setFetchingMsg(true);
      socket.emit("requestOlderMessages", {
        roomId,
        lastMessageId: messages[messages.length - 1].id,
      });
    }
  };

  const [file, setFile] = useState("");

  const pickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      if (result.type === "success") {
        setFile(result);
      } else if (result.type === "cancel") {
        console.log("Document picking canceled.");
      }
    } catch (error) {
      console.log("Error while picking a document:", error);
    }
  };

  const [progress, setProgress] = useState(0);

  const downloadPath =
    FileSystem.documentDirectory + (Platform.OS == "android" ? "" : "");

  const ensureDirAsync = async (dir, intermediates = true) => {
    const props = await FileSystem.getInfoAsync(dir);
    if (props.exist && props.isDirectory) {
      return props;
    }
    let _ = await FileSystem.makeDirectoryAsync(dir, { intermediates });
    return await ensureDirAsync(dir, intermediates);
  };

  const downloadCallback = (downloadProgress) => {
    const progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;
    setProgress(progress);
  };

  const downloadFile = async (fileUrl, fileName) => {
    if (Platform.OS == "android") {
      const dir = ensureDirAsync(downloadPath);
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      fileUrl,
      downloadPath + fileName,
      {},
      downloadCallback
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      if (Platform.OS == "android") saveAndroidFile(uri, fileName);
      else saveIosFile(uri);
    } catch (e) {
      console.error("download error:", e);
    } finally {
      setProgress(0);
    }
  };

  const saveAndroidFile = async (fileUri, fileName) => {
    try {
      const fileString = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        return;
      }

      try {
        await StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          "*/*"
        )
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, fileString, {
              encoding: FileSystem.EncodingType.Base64,
            });
            ToastAndroid.show("File Downloaded", ToastAndroid.SHORT);
          })
          .catch((e) => {});
      } catch (e) {
        throw new Error(e);
      }
    } catch (err) {}
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState("");

  const handleImageClick = (uri) => {
    setImageUri(uri);
    setModalVisible(true);
  };

  const downloadAndShareFile = async (uri, file_name) => {
    const remoteUrl = uri; // Replace this with the actual file URL
    const localFileUri = FileSystem.cacheDirectory + file_name; // Replace 'yourFileName.ext' with the desired file name

    try {
      const downloadResult = await FileSystem.downloadAsync(
        remoteUrl,
        localFileUri
      );

      if (downloadResult.status === 200) {
        // File download successful
        const shareResult = await Sharing.shareAsync(downloadResult.uri);

        if (shareResult && shareResult.action === Sharing.sharedAction) {
          console.log("File shared successfully!");
        } else {
          console.log("Sharing was cancelled or failed.");
        }
      } else {
        console.log("File download failed.");
      }
    } catch (error) {
      console.error("Error while downloading or sharing the file:", error);
    }
  };

  if (!messages) return <Spinner />;

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {progress > 0 && (
          <ProgressBar
            styleAttr="Horizontal"
            indeterminate={false}
            progress={progress}
            style={{ width: "100%", height: 5 }}
            color="#1E319D"
          />
        )}

        {sending && (
          <View>
            <Text style={{ textAlign: "center" }}>
              Uploading: {uploadProgress}%
            </Text>
          </View>
        )}
        <ImageViewer
          uri={imageUri}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />

        <FlatList
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <>
              {fetchingMsg && (
                <ActivityIndicator size="small" color="#1E319D" />
              )}
            </>
          )}
          onEndReached={() => handleFetchMore()}
          data={messages}
          keyExtractor={(item) => item.id}
          initialNumToRender={10}
          inverted
          renderItem={({ item, index }) => {
            const msg = item;

            const messageDate = new Date(msg.date);

            const previousDate =
              index > 0 ? new Date(messages[index - 1].date) : null;

            const isCurrentDayToday = isToday(messageDate);

            const isPreviousDayToday = previousDate
              ? isToday(previousDate)
              : false;

            let messageDateLabel = "";

            if (isCurrentDayToday && !isPreviousDayToday) {
              messageDateLabel = "Today";
            } else if (!isCurrentDayToday) {
              messageDateLabel = messageDate.toDateString();
            }

            const isLastMessageOfDate =
              index === messages.length - 1 ||
              !isSameDate(messageDate, new Date(messages[index + 1].date));

            return (
              <View
                key={index}
                onFocus={() => markMessageAsRead(message.id)}
              >
                {isLastMessageOfDate && (
                  <Text style={{ textAlign: "center", color: "grey" }}>
                    {messageDateLabel ? messageDateLabel : "Today"}
                  </Text>
                )}

                {/* message box */}
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignSelf: msg.userid == userid ? "flex-end" : "flex-start",
                    margin: 10,
                    marginTop: 10,
                    marginBottom: 5,
                  }}
                >
                  {msg.message_type === "i" ? ( //if i --image
                    <TouchableOpacity
                      style={{
                        backgroundColor:
                          msg.userid == userid ? "#373B58" : "#F0F0F0",
                        borderRadius: 20,
                        borderBottomLeftRadius: msg.userid == userid ? 20 : 0,
                        borderBottomRightRadius: msg.userid == userid ? 0 : 20,
                        padding: 10,
                        alignSelf: "flex-start",
                        maxWidth: "85%",
                      }}
                      activeOpacity={1}
                      onPress={() => {
                        handleImageClick(`${config.API_URL}/${msg.file_uri}`);
                      }}
                      onLongPress={() =>
                        downloadAndShareFile(
                          `${config.API_URL}/${msg.file_uri}`,
                          msg.file_name
                        )
                      }
                    >
                      <Image
                        source={{ uri: `${config.API_URL}/${msg.file_uri}` }}
                        style={{
                          width: "100%",
                          height: undefined,
                          aspectRatio: 1,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        backgroundColor:
                          msg.userid == userid
                            ? "rgba(30,49,157,0.7)"
                            : "#F0F0F0",
                        borderRadius: 20,
                        borderBottomLeftRadius: msg.userid == userid ? 20 : 0,
                        borderBottomRightRadius: msg.userid == userid ? 0 : 20,
                        padding: 10,
                        alignSelf: "flex-start",
                        maxWidth: "85%",
                      }}
                      activeOpacity={1}
                    >
                      {/* t --text */}

                      {msg.message_type === "t" && (
                        <Text
                          style={{
                            color: msg.userid == userid ? "#fff" : "#000",
                          }}
                        >
                          {msg.message}
                        </Text>
                      )}

                      {msg.message_type === "a" && ( //a mimetype aplication/*
                        <TouchableOpacity
                          onPress={() =>
                            downloadFile(
                              `${config.API_URL}/${msg.file_uri}`,
                              msg.file_name
                            )
                          }
                          onLongPress={() =>
                            downloadAndShareFile(
                              `${config.API_URL}/${msg.file_uri}`,
                              msg.file_name
                            )
                          }
                        >
                          <Text
                            numberOfLines={1}
                            style={{
                              color: msg.userid == userid ? "#fff" : "#000",
                            }}
                          >
                            <Ionicons
                              name="document-outline"
                              size={20}
                              color={msg.userid == userid ? "#fff" : "#000"}
                            />{" "}
                            {msg.file_name}
                          </Text>
                          <Text
                            style={{
                              color: msg.userid == userid ? "#fff" : "#000",
                              fontSize: 12,
                            }}
                          >
                            {getFileSize(msg.file_size)}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {/* date */}
                <Text
                  style={{
                    color: "grey",
                    textAlign: msg.userid == userid ? "right" : "left",
                    fontSize: 11,
                    paddingLeft: msg.userid == userid ? 0 : 10,
                    paddingRight: msg.userid == userid ? 10 : 0,
                  }}
                >
                  {getTime(msg.date)}{" "}
                  {msg.userid !== userid &&
                    msg.message_type == "a" &&
                    " ~ attachment"}
                </Text>
              </View>
            );
          }}
        />
      </View>

      <View
        style={{
          width: "100%",
          backgroundColor: "#fff",
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: 0.5,
          borderTopColor: "lightgrey",
        }}
      >
        {!file ? (
          <TouchableOpacity
            style={{ backgroundColor: "#fff", borderRadius: 20 }}
            activeOpacity={0.7}
            onPress={() => pickAttachment()}
          >
            <Icon name="add-circle" size={30} color="#1E319D" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: "#fff", borderRadius: 20 }}
            activeOpacity={0.7}
            onPress={() => setFile("")}
          >
            <Icon name="close" size={30} color="#1E319D" />
          </TouchableOpacity>
        )}

        {file ? (
          <TouchableOpacity
            style={{
              maxHeight: 100,
              paddingHorizontal: 20,
              display: "flex",
              flexDirection: "row",
              flex: 1,
              backgroundColor: "#F1F2F6",
              marginHorizontal: 10,
              borderRadius: 10,
            }}
            activeOpacity={1}
          >
            <Ionicons name="document-outline" size={30} color="grey" />
            <View>
              <Text
                style={{ color: "#000", marginRight: 10 }}
                numberOfLines={1}
              >
                {file.name}
              </Text>
              <Text style={{ color: "#000" }} numberOfLines={1}>
                {getFileSize(file.size)}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TextInput
            style={{
              flex: 1,
              padding: 10,
              marginLeft: 10,
              marginRight: 10,
              fontSize: 14,
              backgroundColor: "#F1F2F6",
              borderRadius: 20,
              maxHeight: 100,
            }}
            placeholder={"Write a message..."}
            multiline
            onChangeText={setMessage}
            value={message}
          />
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => sendMessage(message)}
        >
          <Icon name="send" size={30} color="#1E319D" />
        </TouchableOpacity>
      </View>
    </>
  );
};
