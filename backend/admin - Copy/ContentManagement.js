import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import SearchBar from "react-native-dynamic-search-bar";
import { Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebase/config';

const ContentManagement = () => {
  const [posts, setPosts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [refreshing, setRefreshing] = useState(false); // State for pull to refresh
  const navigation = useNavigation();

  useEffect(() => {
    fetchFirestoreData();
  }, []);

  const fetchFirestoreData = async () => {
    try {
      const firestore = firebase.firestore();
      const postsRef = firestore.collection('posts');
  
      // Fetch all posts data
      const snapshot = await postsRef.get();
      const postData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Filter the posts where reportedBy array length is greater than 0
      const filteredPosts = postData.filter((post) => post.reportedBy.length > 0);
  
      // Fetch users data where id matches reportedBy array
      const usersRef = firestore.collection('users');
      const usersSnapshot = await usersRef.where('id', 'in', filteredPosts.map((post) => post.reportedBy)).get();
      const usersData = usersSnapshot.docs.map((doc) => doc.data());
  
      // Add email addresses of reportedBy users to the filtered posts
      const postsWithUsers = filteredPosts?.map((post) => ({
        ...post,
        reportedByUsers: post.reportedBy.map((userId) => {
          const user = usersData.find((userData) => userData.id === userId);
          return user ? user.email : '';
        }),
        reportedPostCount: filteredPosts.length,
        totalPostCount: postData.length,
      }));
  
      // Count the number of reported posts
      const reportedPostCount = filteredPosts.length;
  
      // Count the total number of posts
      const totalPostCount = postData.length;
  
      console.log('Reported Posts Count:', reportedPostCount);
      console.log('Total Posts Count:', totalPostCount);
      console.log(postsWithUsers);
      setPosts(postsWithUsers);
    } catch (error) {
      console.error('Error fetching Firestore data:', error);
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    fetchFirestoreData()
      .then(() => setRefreshing(false))
      .catch((error) => {
        console.error('Error refreshing data:', error);
        setRefreshing(false);
      });
  };

  const searchFunction = (text) => {
    setSearchValue(text);
  
    // Filter the posts based on the search value
    const filteredPosts = posts.filter((post) =>
      post.postByEmail.toLowerCase().includes(text.toLowerCase())
    );
  
    setPosts(filteredPosts);
    setSearchValue(text);
    if (text === '')
      fetchFirestoreData();
  };

  const renderPostItem = ({ item, index }) => {
    return (
      <View style={{ paddingHorizontal: 10 }}>
        <View style={styles.table_body_single_row}>
          <View style={{ width: '5%', alignItems: 'center' }}>
            <Text style={styles.table_data}>{index + 1}</Text>
          </View>
          <View style={{ width: '36%', alignItems: 'center' }}>
            <Text style={[styles.table_data, { fontWeight: 'bold' }]}>{item.postByEmail}</Text>
          </View>
          <View style={{ width: '47%', alignItems: 'center' }}>
            <Text style={styles.table_data}>{item.reportedBy.length}</Text>
          </View>
          <View style={{ width: '12%', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate("ReportDetails", { postId: item.id })}>
              <Text style={{ fontSize: 12 }}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={{ flexDirection:'row-reverse', columnGap: 16, padding: 5 }}>
          <View style={styles.card}>
            <View style={styles.iconsView}>
              <Icon name="error" color={'red'} size={30} style={styles.icons} />
            </View>
            <View style={styles.details}>
              <Text style={styles.textFonts2}>Total Reports</Text>
              <Text style={styles.textFonts1}>{posts[0]?.reportedPostCount}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.iconsView}>
              <Icon name="image" color={'#8f00ff'} size={30} style={styles.icons} />
            </View>
            <View style={styles.details}>
              <Text style={styles.textFonts2}>Total Posts</Text>
              <Text style={styles.textFonts1}>{posts[0]?.totalPostCount}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ padding: 5 }}>
        <View>
          <SearchBar
            placeholder="Search"
            style={styles.search}
            value={searchValue}
            onChangeText={(text) => searchFunction(text)}
            autoCorrect={true}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 5, marginTop: 10}}>
        <View style={[styles.table_body_single_row, { backgroundColor: 'black', borderTopStartRadius: 5, borderTopEndRadius: 5, 
        paddingHorizontal:10 }]}>
          <View style={{ width: '6%', alignItems: 'center', paddingVertical: 3 }}>
            <Text style={styles.table_head}>ID</Text>
          </View>
          <View style={{ width: '34%', alignItems: 'center', paddingVertical: 3 }}>
            <Text style={styles.table_head}>Post By</Text>
          </View>
          <View style={{ width: '46%', alignItems: 'center', paddingVertical: 3 }}>
            <Text style={styles.table_head}>Reported By</Text>
          </View>
          <View style={{ width: '14%', alignItems: 'center' }}>
            <Text style={styles.table_head}>Action</Text>
          </View>
        </View>
      </View>

     <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPostItem}
      refreshing={refreshing}
      onRefresh={refreshData}
      progressViewOffset={50} // Optional: Adjust the distance of the refreshing indicator from the top
    />

    </View>
  );
};

export default ContentManagement;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  search: {
    width: '100%',
    backgroundColor:"#F2F6F8",
    marginVertical:10
  },
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 4.68,
    elevation: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 10,
    width: '47.5%',
    alignItems: 'center',
  },
  details: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
    paddingBottom: 10,
  },
  iconsView: {
    width: '79%',
  },
  icons: {
    borderWidth: 2,
    borderColor: 'white',
    padding: 5,
    borderRadius: 200,
    backgroundColor: 'white',
  },
  textFonts1: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8a8e93',
  },
  textFonts2: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8a8e93',
  },
  table_body_single_row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#8a8e93',
    paddingVertical: 15,
  },
  table_data: {
    fontSize: 11,
  },
  table_head: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
});
