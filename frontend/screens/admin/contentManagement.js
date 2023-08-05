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
import { getTimeDifference2, capitalizeWords } from "../fn";
import PostInfo from "./PostInfo";
import { TouchableOpacity } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Spinner from "../custom/Spinner";

const UserManagement = () => {
  const token = useSelector((state) => state.token);

  const [userData, setUserData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all"); // Default to showing all users
  const [fliteredPost, setFliteredPost] = useState([]); // Store filtered users

  const [loading, setLoading] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused)
    fetchData();
  }, [isFocused]);

  useEffect(() => {
    // Filter the post data when the filter or searchText changes
    const filteredData = userData.filter(
      (post) =>
        (filter === "all" || post.posttype === filter) &&
        (post?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        post?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        post?.cid?.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFliteredPost(filteredData);
  }, [userData, filter, searchText]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/reported_posts`, {
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

  const handleFilterJobPost = () => {
    setFilter("job_post");
  };

  const handleFilterFeedPost = () => {
    setFilter("feed_post");
  };

  const handleFilterAll = () => {
    setFilter("all");
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [post, setPost] = useState('');

  if (loading) return(<Spinner/>)

  return (
    <SafeAreaView style={styles.container}>
    <PostInfo  isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} post={post} setPost={setPost} fetchData={fetchData}/>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name / email / CID"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <View style={{ display: "flex", flexDirection: "row", marginBottom: 10 }}>
        <TouchableHighlight style={styles.filterButton} onPress={handleFilterAll} underlayColor="grey">
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableHighlight>
        <TouchableHighlight style={styles.filterButton} onPress={handleFilterJobPost} underlayColor="grey">
          <Text style={styles.filterButtonText}>Job Posts</Text>
        </TouchableHighlight>
        <TouchableHighlight style={styles.filterButton} onPress={handleFilterFeedPost} underlayColor="grey">
        <Text style={styles.filterButtonText}>Feed Posts</Text>
        </TouchableHighlight>
      </View>

      <View style={{ paddingHorizontal: 5, marginTop: 10 }}>
        <View
          style={[
            styles.table_body_single_row,
            { backgroundColor: 'grey', borderTopStartRadius: 5, borderTopEndRadius: 5 },
          ]}
        >
          <View style={{ flex:0.8, paddingVertical: 3 }}>
            <Text style={styles.table_head}>Sl No</Text>
          </View>

          <View style={{ flex:3, paddingVertical: 3 }}>
            <Text style={styles.table_head}>Post by Username & email</Text>
          </View>

          <View style={{ flex:1, paddingVertical: 3 }}>
          {/* <Text style={[styles.table_head, {textAlign:'center'}]}>Post Type</Text> */}
          <Text style={[styles.table_head, {textAlign:'center'}]}>Report Count</Text>
          </View>

        </View>
      </View>

      <FlatList
        data={fliteredPost} // Render the filtered users
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => {
          return (
            <View style={{ paddingHorizontal: 10 }}>
              <TouchableOpacity style={styles.table_body_single_row} activeOpacity={1} onPress={()=>{setIsModalVisible(true),setPost(item)}}>
                <View style={{ flex:0.8 }}>
                  <Text style={[styles.table_data, {textAlignVertical:'center', flex:1}]}>{index+1}</Text>
                </View>
            
                <View style={{ flex:3}}>
                  <Text style={[styles.table_data, { fontWeight: 'bold',}]}>{capitalizeWords(item.name)}</Text>
                  <Text style={styles.table_data}>{item.email}</Text>
                </View>

                <View style={{ flex:1, justifyContent:'center'}}>
                <Text style={[styles.table_data, {textAlign:'center', paddingLeft:5}]}>
                  {item.reportedby.length}
                </Text>

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
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#f0f0f0",
  },
  searchBarContainer: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal:10
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    flex: 1,    borderWidth:1, borderColor:'lightgrey'
  },
  filterButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "lightgrey",
    borderRadius: 8,
    borderWidth:1, borderColor:'lightgrey'
  },
  filterButtonText: {
    // color: "#fff",
    // fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Center the separator
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
    width: 130, // Adjust the width as needed
  },
  horizontalLine: {
    height: 1,
    borderColor: "lightgrey",
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  table_body_single_row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: 'lightgrey',
    paddingVertical: 15,
    paddingHorizontal:20
  },
  table_data: {
    fontSize: 12,
    
  },
  table_head: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default UserManagement;
