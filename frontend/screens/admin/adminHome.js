import React from "react";
import { View, Text, StyleSheet } from "react-native";
import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config";
import { getFileSize } from "../fn";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import Spinner from "../custom/Spinner";

const AdminHome = () => {
  const token = useSelector((state) => state.token);

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) getUserData();
  }, [isFocused]);

  const getUserData = () => {
    setLoading(true);
    axios
      .get(`${config.API_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e.response.data);
      });
  };

  if (loading) return <Spinner />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dataContainer}>
        <View style={styles.dataRow}>
          <DataItem
            label="Total Users"
            value={data.totalUserCount}
            iconName="people"
          />
          <DataItem
            label="Total Admins"
            value={
              data.userCountByRole && data.userCountByRole.admin
                ? data.userCountByRole.admin
                : 0
            }
            iconName="admin-panel-settings"
          />
        </View>
        <View style={styles.dataRow}>
          <DataItem
            label="Total Job Seekers"
            value={
              data.userCountByRole && data.userCountByRole.js
                ? data.userCountByRole.js
                : 0
            }
            iconName="person"
          />
          <DataItem
            label="Total Employers"
            value={
              data.userCountByRole && data.userCountByRole.em
                ? data.userCountByRole.em
                : 0
            }
            iconName="business"
          />
        </View>
        <View style={styles.dataRow}>
          <DataItem
            label="Total Job Posts"
            value={data.jobPostsCount ? data.jobPostsCount : 0}
            iconName="work"
          />
          <DataItem
            label="Total Feed Posts"
            value={data.feedPostsCount ? data.feedPostsCount : 0}
            iconName="article"
          />
        </View>
        <View style={styles.dataRow}>
          <DataItem
            label="Database Used"
            value={data.databaseSize ? data.databaseSize : 0}
            iconName="storage"
          />
          <DataItem
            label="Total Media Size"
            value={data.mediaSize ? getFileSize(data.mediaSize) : 0}
            iconName="photo"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const DataItem = ({ label, value, iconName }) => {
  return (
    <View style={styles.dataItemContainer}>
      <Icon name={iconName} size={40} color="#333" />
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
    paddingVertical: 20,
    backgroundColor: "#f0f0f0",
  },
  dataContainer: {
    borderRadius: 8,
    padding: 10,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dataItemContainer: {
    width: "48%",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    elevation: 1,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  dataValue: {
    fontSize: 16,
  },
});

export default AdminHome;
