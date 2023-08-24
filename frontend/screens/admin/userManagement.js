import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableHighlight,
  FlatList,
} from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import config from "../config";
import { capitalizeWords } from "../fn";
import UserInfo from "./UserInfo";
import { TouchableOpacity } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Spinner from "../custom/Spinner";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";

const UserManagement = () => {
  const token = useSelector((state) => state.token);

  const [userData, setUserData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) fetchUserData();
  }, [isFocused]);

  useEffect(() => {
    const filteredData = userData
      .filter(
        (user) =>
          filter === "all" ||
          user.role === filter ||
          (filter === "pending" && user.verification_status === "pending") ||
          (filter === "verified" && user.verification_status === "verified")
      )
      .filter(
        (user) =>
          user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    setFilteredUsers(filteredData);
  }, [userData, filter, searchText]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
      console.log(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleFilterJobSeeker = () => {
    setFilter("js");
  };

  const handleFilterEmployer = () => {
    setFilter("em");
  };

  const handleFilterAll = () => {
    setFilter("all");
  };

  const handleShowVerificationRequest = () => {
    setFilter("pending");
  };
  const handleShowVerificatedAccounts = () => {
    setFilter("verified");
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [user, setUser] = useState("");

  if (loading) return <Spinner />;

  return (
    <SafeAreaView style={styles.container}>
      <UserInfo
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        user={user}
        setUser={setUser}
        fetchUserData={fetchUserData}
      />

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name or email"
          value={searchText}
          onChangeText={handleSearch}
        />
      
      </View>

      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}> */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TouchableHighlight
          style={[
            styles.filterButton,
            { backgroundColor: filter === "all" ? "grey" : "lightgrey" },
          ]}
          onPress={handleFilterAll}
          underlayColor="grey"
        >
          <Text>All</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={[
            styles.filterButton,
            { backgroundColor: filter === "js" ? "grey" : "lightgrey" },
          ]}
          onPress={handleFilterJobSeeker}
          underlayColor="grey"
        >
          <Text>Job Seeker</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={[
            styles.filterButton,
            { backgroundColor: filter === "em" ? "grey" : "lightgrey" },
          ]}
          onPress={handleFilterEmployer}
          underlayColor="grey"
        >
          <Text>Employer</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={[
            styles.filterButton,
            { backgroundColor: filter === "verified" ? "grey" : "lightgrey" },
          ]}
          onPress={handleShowVerificatedAccounts}
          underlayColor="grey"
        >
          <Text>Verified Users</Text>
        </TouchableHighlight>

      </View>

      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TouchableHighlight
          style={[
            styles.filterButton,
            { backgroundColor: filter === "pending" ? "grey" : "lightgrey" },
          ]}
          onPress={handleShowVerificationRequest}
          underlayColor="grey"
        >
          <Text>Verification Request</Text>
        </TouchableHighlight>

        <MaterialIcons
          name="refresh"
          size={24}
          onPress={() => fetchUserData()}
          style={{textAlignVertical:'center', marginLeft:10}}
        />
      </View>

      {/* </ScrollView> */}

      <View style={{ paddingHorizontal: 5, marginTop: 10 }}>
        <View
          style={[
            styles.table_body_single_row,
            {
              backgroundColor: "grey",
              borderTopStartRadius: 5,
              borderTopEndRadius: 5,
            },
          ]}
        >
          <View style={{ flex: 0.8, paddingVertical: 3 }}>
            <Text style={styles.table_head}>Sl No</Text>
          </View>

          <View style={{ flex: 1, paddingVertical: 3 }}>
            <Text style={styles.table_head}>Profile</Text>
          </View>

          <View style={{ flex: 3, paddingVertical: 3 }}>
            <Text style={styles.table_head}>User name & email</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        ListFooterComponent={() => <View style={{ margin: 100 }} />}
        renderItem={({ item, index }) => {
          return (
            <View style={{ paddingHorizontal: 10, flex: 1 }}>
              <TouchableOpacity
                style={styles.table_body_single_row}
                activeOpacity={1}
                onPress={() => {
                  setIsModalVisible(true), setUser(item);
                }}
              >
                <View style={{ flex: 0.8 }}>
                  <Text
                    style={[
                      styles.table_data,
                      { textAlignVertical: "center", flex: 1 },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <View style={{ flex: 1, justifyContent: "center" }}>
                  {item.imageurl && item.imageurl.length > 0 ? (
                    <Image
                      source={{ uri: `${config.API_URL}/${item.imageurl}` }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 60,
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
                        borderRadius: 60,
                        borderColor: "lightgrey",
                        borderWidth: 1,
                      }}
                    />
                  )}
                </View>
                <View style={{ flex: 3 }}>
                  <Text style={[styles.table_data, { fontWeight: "bold" }]}>
                    {capitalizeWords(item.name)}
                  </Text>
                  <Text style={styles.table_data}>{item.email}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex:1,
    paddingTop: 10,
    backgroundColor: "#f0f0f0",
  },
  searchBarContainer: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: "lightgrey",
  },
  filterButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "lightgrey",
    // flex:1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "lightgrey",
    paddingVertical: 8,
  },
  headerCell: {
    fontWeight: "bold",
  },
  cell: {
    flex: 1,
  },
  cellWidth: {
    width: 130,
  },
  horizontalLine: {
    height: 1,
    borderColor: "lightgrey",
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  table_body_single_row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "lightgrey",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  table_data: {
    fontSize: 12,
  },
  table_head: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
});

export default UserManagement;
