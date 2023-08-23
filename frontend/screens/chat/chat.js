import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image } from "react-native";
import axios from "axios";
import config from "../config";
import { useSelector } from "react-redux";
import jwtDecode from "jwt-decode";
import { capitalizeWords, getTimeDifference2 } from "../fn";
import { TouchableHighlight } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Spinner from "../custom/Spinner";

const Chat = ({ navigation }) => {
  const [chatRooms, setChatRooms] = useState([]);

  const token = useSelector((state) => state.token);
  const id = jwtDecode(token).userid;
  console.log(id);

  const [loading, setLoading] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) fetchChatRooms();

    return () => {
      setChatRooms([]);
    };
  }, [isFocused]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.API_URL}/api/chat_rooms/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChatRooms(response.data);
      if (response.data) setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Spinner />;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          return (
            <TouchableHighlight
              key={item.id}
              onPress={() =>
                navigation.navigate("ChatRoom", {
                  touserid: item.user1 != id ? item.user1 : item.user2,
                  title:
                    item.user1 != id
                      ? capitalizeWords(item.user1_name)
                      : capitalizeWords(item.user2_name),
                  imageurl: item.other_user_imageurl,
                })
              }
              underlayColor="#F1F2F6"
              style={{
                backgroundColor: "#fff",
                borderColor: "rgba(49, 105, 210, 0.5)",
                borderWidth: 0.25,
                borderTopWidth: 0,
              }}
            >
              <>
                <View style={{ flexDirection: "row", padding: 15, flex: 1 }}>
                  {item.other_user_imageurl.length > 0 ? (
                    <Image
                      source={{
                        uri: `${config.API_URL}/${item.other_user_imageurl}`,
                      }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        borderColor: "lightgrey",
                        borderWidth: 1,
                      }}
                    />
                  ) : (
                    <Image
                      source={require("../../assets/images/default.png")}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        borderColor: "lightgrey",
                        borderWidth: 1,
                      }}
                    />
                  )}
                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 15,
                        paddingLeft: 10,
                        textAlignVertical: "top",
                      }}
                    >
                      {item.user1 != id
                        ? capitalizeWords(item.user1_name)
                        : capitalizeWords(item.user2_name)}
                      {console.log(id, "current users", typeof id)}
                    </Text>

                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flexDirection: "row", paddingTop: 5 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            paddingLeft: 10,
                            textAlignVertical: "center",
                            color: "grey",
                          }}
                        >
                          {item.message_by_userid == id
                            ? "Message Sent"
                            : "Message Recieved "}
                        </Text>
                        {item.message_by_userid != id &&
                          item.unread_count > 0 && (
                            <Text
                              style={{
                                backgroundColor: "rgba(30,49,157,0.7)",
                                fontSize: 12,
                                color: "#fff",
                                borderRadius: 50,
                                width: 20,
                                height: 20,
                                textAlign: "center",
                                textAlignVertical: "center",
                              }}
                            >
                              {item.unread_count}
                            </Text>
                          )}
                      </View>

                      <Text
                        style={{
                          textAlign: "right",
                          textAlignVertical: "bottom",
                          fontSize: 12,
                          color: "grey",
                        }}
                      >
                        {getTimeDifference2(item.date)}
                      </Text>
                    </View>
                  </View>
                </View>

              </>
            </TouchableHighlight>
          );
        }}
      />
    </View>
  );
};

export default Chat;
