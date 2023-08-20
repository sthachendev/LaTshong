import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Image, TouchableWithoutFeedback } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import config from "../config";
import { TouchableHighlight } from "react-native";
import { capitalizeWords } from "../fn";
import { useSelector } from "react-redux";

export default function Search({ navigation }) {

  const [searchText, setSearchText] = useState("");
  const [searchResult, setsearchResult] = useState('');

  const role = useSelector(state=>state.role);

  const handleSearch = async () => {
    try {
      if (searchText.trim() !== "") {
        const response = await axios.get(`${config.API_URL}/api/post-jobs/search`, {
          params: { query: searchText },
        });

        setsearchResult(response.data);
        console.log("search:", response.data);
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
    <View style={{backgroundColor:'#fff', flex:1}}>
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        marginHorizontal: 5,
        backgroundColor: '#F1F2F6',
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
        placeholder="Search Job"
        value={searchText}
        onChangeText={setSearchText}
      />

    <TouchableOpacity onPress={()=>navigation.goBack()}>
       <Icon
            name="close"
            size={25}
            color="grey"
        />
       </TouchableOpacity>
    </View>

      </View>

       {
        searchText.trim() === '' &&
          <Image style={{ width: 200, height: 200, alignSelf:"center",  }} source={require("../../assets/images/search.png")} />
       }

        <FlatList
        data={searchResult} // Pass the usersData as the data for the FlatList
        renderItem={({ item }) => (
          <TouchableOpacity style={{backgroundColor:'#fff', padding:10, paddingHorizontal:20}} activeOpacity={1}
          onPress={() => navigation.navigate('PostDetails', { id: item.id, role })}>
            <>
            <Text style={{ textAlign: "left", fontWeight:'bold' }}>{capitalizeWords(item.job_title)}</Text>
            <Text style={{ textAlign: "left", color:'grey' }} numberOfLines={2}>{item.job_description}</Text>
            </>
          </TouchableOpacity>
        )}
        ListEmptyComponent={()=>{
          return(
            <>
              {
                searchText.trim() !== '' && <Text style={{textAlign:"center", marginVertical:30, color:"grey"}}>No result found</Text>
              }
            </>
          )
        }}
        keyExtractor={(item) => item.id} // Provide a unique key for each item
        maxToRenderPerBatch={4}
        />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  myMap: {
    flex: 1,
    backgroundColor: "white",
    width: "100%",
  },
});
