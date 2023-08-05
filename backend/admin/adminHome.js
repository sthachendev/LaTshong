import { View, StyleSheet, Text } from 'react-native';
import { Icon } from '@rneui/themed';
import { ScrollView } from 'react-native-gesture-handler';
import { firebase } from '../../firebase/config';
import { useState, useEffect } from 'react';
import { formatSize } from '../fn/fn';

export default function AdminHome() {
  const [userData, setUserData] = useState([]);
  const [suspendedUserCount, setSuspendedUserCount] = useState(0);
  const [reportedPostsCount, setReportedPostsCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  const fetchFirestoreData = async () => {
    try {
      const firestore = firebase.firestore();
      const usersRef = firestore.collection('users');
      const postsRef = firestore.collection('posts');
      const commentsRef = firestore.collection('comments');
      const collectionsRef = firestore.collection('collections');
      const notificationsRef = firestore.collection('notifications');

      // Fetch user data
      const usersSnapshot = await usersRef.get();
      const userData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Count the number of suspended users
      const suspendedUserCount = userData.reduce(
        (count, user) => (user.isSuspended ? count + 1 : count),
        0
      );

      // Fetch posts data
      const postsSnapshot = await postsRef.get();
      const postsData = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Count the number of posts with non-empty reportedBy array
      const reportedPostsCount = postsData.reduce(
        (count, post) => (post.reportedBy.length > 0 ? count + 1 : count),
        0
      );

      // Fetch comments data
      const commentsSnapshot = await commentsRef.get();
      const commentsData = commentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate the size of comments
      const commentsSize = commentsData.reduce(
        (size, comment) => size + JSON.stringify(comment).length,
        0
      );

      // Fetch collections data
      const collectionsSnapshot = await collectionsRef.get();
      const collectionsData = collectionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate the size of collections
      const collectionsSize = collectionsData.reduce(
        (size, collection) => size + JSON.stringify(collection).length,
        0
      );

      // Fetch notifications data
      const notificationsSnapshot = await notificationsRef.get();
      const notificationsData = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate the size of notifications
      const notificationSize = notificationsData.reduce(
        (size, notification) => size + JSON.stringify(notification).length,
        0
      );

      // Calculate the total size
      const totalSize =
        JSON.stringify(userData).length +
        JSON.stringify(postsData).length +
        commentsSize +
        collectionsSize +
        notificationSize;

      // Update state with the fetched data
      setUserData(userData);
      setSuspendedUserCount(suspendedUserCount);
      setReportedPostsCount(reportedPostsCount);
      setTotalSize(totalSize);

      console.log(userData);
      console.log(postsData);
    } catch (error) {
      console.error('Error fetching Firestore data:', error);
    }
  };

  useEffect(() => {
    fetchFirestoreData();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ flexDirection: 'row', columnGap: 20, padding: 5 }}>
          <View style={styles.card}>
            <View style={styles.iconsView}>
              <Icon name="group" color={'green'} size={50} style={styles.icons} />
            </View>
            <View style={styles.details}>
              <Text style={styles.textFonts2}>Total Users</Text>
              <Text style={styles.textFonts1}>{userData.length}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.iconsView}>
              <Icon name="person-remove" color={'red'} size={50} style={styles.icons} />
            </View>
            <View style={styles.details}>
              <Text style={styles.textFonts2}>Suspended Users</Text>
              <Text style={styles.textFonts1}>{suspendedUserCount}</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', columnGap: 20, padding: 5 }}>
          <View style={styles.card}>
            <View style={styles.iconsView}>
              <Icon name="error" color={'red'} size={50} style={styles.icons} />
            </View>
            <View style={styles.details}>
              <Text style={styles.textFonts2}>Posts Reports</Text>
              <Text style={styles.textFonts1}>{reportedPostsCount}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.iconsView}>
              <Icon name="folder" color={'orange'} size={50} style={styles.icons} />
            </View>
            <View style={styles.details}>
              <Text style={styles.textFonts2}>DB Size Used</Text>
              <Text style={styles.textFonts1}>{formatSize(totalSize)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingTop: 15,
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 4.68,
    shadowOpacity: 0.56,
    shadowRadius: 4.68,
    elevation: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 20,
    width: '46.5%',
    alignItems: 'center',
  },
  details: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
    padding: 10,
  },
  iconsView: {
    padding: 30,
  },
  icons: {
    borderWidth: 2,
    borderColor: 'white',
    padding: 5,
    borderRadius: 200,
    backgroundColor: 'white',
  },
  textFonts1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8a8e93',
  },
  textFonts2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8a8e93',
  },
});
