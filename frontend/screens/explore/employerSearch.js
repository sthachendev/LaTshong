import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import config from "../config";
import { capitalizeWords } from "../fn";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function EmployerSearch({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [searchResult, setsearchResult] = useState([]);

  const handleSearch = async () => {
    try {
      if (searchText.trim() !== "") {
        const response = await axios.get(`${config.API_URL}/api/search/users`, {
          params: { query: searchText },
        });
        setsearchResult(response.data);
      } else {
        setsearchResult([]);
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchText]);

  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 5,
            marginHorizontal: 5,
            backgroundColor: "#F1F2F6",
            borderRadius: 10,
          }}
        >
          <Icon
            name="search"
            size={18}
            color="grey"
            style={{ marginHorizontal: 10 }}
          />
          <TextInput
            autoFocus={true}
            style={{
              flex: 1,
              fontSize: 14,
            }}
            placeholder="Search Talent"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.trim() !== "" && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Icon name="close" size={25} color="grey" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchText.trim() === "" && (
        <Image
          style={{ width: 200, height: 200, alignSelf: "center" }}
          source={require("../../assets/images/search.png")}
        />
      )}

      <FlatList
        data={searchResult}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              padding: 10,
              paddingHorizontal: 20,
            }}
            activeOpacity={1}
            onPress={() =>
              navigation.navigate("ViewProfile", { userid: item.id })
            }
          >
            <>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ textAlign: "left", fontWeight: "bold" }}>
                  {capitalizeWords(item.name)}
                </Text>
                <Text
                  style={{
                    marginLeft: 5,
                    color: "grey",
                    fontSize: 12,
                    textAlignVertical: "center",
                  }}
                >
                  {item.verification_status == "verified" && (
                    <MaterialIcons name="verified" color="blue" size={16} />
                  )}
                </Text>
              </View>

              <Text
                style={{ textAlign: "left", color: "grey" }}
                numberOfLines={2}
              >
                {item.email}
              </Text>
            </>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => {
          return (
            <>
              {searchText.trim() !== "" && (
                <Text
                  style={{
                    textAlign: "center",
                    marginVertical: 30,
                    color: "grey",
                  }}
                >
                  No result found
                </Text>
              )}
            </>
          );
        }}
        keyExtractor={(item) => item.id}
        maxToRenderPerBatch={4}
      />
    </View>
  );
}
