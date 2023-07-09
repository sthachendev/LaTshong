import React, { useEffect, useState, } from "react";
import { View, Text, TouchableHighlight, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import axios from "axios";
import config from "../config";
import { capitalizeWords, getTimeDifference } from "../fn";
import { useNavigation } from "@react-navigation/native";

export default PostDetails = ({ route }) => {
  const { id } = route.params;
  const [data, setData] = useState('');
  const [userData, setUserData] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    console.log(id);
    getJobPost();

    return () => {
      setData('');
      setUserData('');
     };
     
  }, []);

const getJobPost = async () => {
  try {
    const res = await axios.get(`${config.API_URL}/api/get_job_post/${id}`);
    setData(res.data);
    const applicants = res.data[0].applicants;
    // console.log(applicants)
    const response = await axios.get(`${config.API_URL}/api/get_user_info`, {
      params: {
        userArray: applicants
      }
    });
    // console.log(response.data,'response');
    setUserData(response.data);
  } catch (error) {
    console.error(error);
  }
};
  
const [selectedOption, setSelectedOption] = useState("all");

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if(option === 'all'){
        console.log(option);
    }else if(option === 'p'){
        console.log(option);
    }else if(option === 'a'){
        console.log(option);
    }else if(option === 'r'){
        console.log(option);
    }
}

const renderUserItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.itemContainer} activeOpacity={.8} 
      onPress={()=>navigation.navigate('Profile', { userid: item.id })}>
        <View style={{padding:10}}>
      <View style={{display:"flex", flexDirection:"row", flex:1}}>
        {item.imageurl !== null ? 
        <Image source={{ uri: `${item.imageurl}` }} style={{width:40, height:40, borderRadius:15}} />
        :
        <View style={{width:40, height:40, backgroundColor:"#000", borderRadius:20}}/>
        }
        <View>
        <Text style={{marginLeft:5, fontWeight:"bold", fontSize:14}}>{capitalizeWords(item.name)}</Text>
        <Text style={{color:"grey", marginLeft:5}}>{item.email}</Text>
        </View>

        <TouchableHighlight style={[styles.btn2, {position:"absolute", top:0, right:0}]} underlayColor="#F1F2F6" 
        onPress={() => handleOptionSelect("all")}>
        <Text style={[styles.btnText, { color:'grey' }]}>
        Accept
        </Text>
      </TouchableHighlight>

      </View>
    
      
    </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {/* Display the fetched data */}
      <View style={{padding:10, backgroundColor:"#fff", elevation:2, margin:10, borderRadius:5}}>
      {data && (
        <>
        <View style={{display:"flex", flexDirection:"row",}}>
      {data[0].imageurl !== null ? 
      <Image source={{ uri: `${data[0].imageurl}` }} style={{width:40, height:40, borderRadius:15}} />
      :
      <View style={{width:40, height:40, backgroundColor:"#000", borderRadius:20}}/>
      }
      <View>
      <Text style={{marginLeft:5, fontWeight:"bold", fontSize:14}}>{capitalizeWords(data[0].name)}</Text>
      <Text style={{color:"grey", marginLeft:5}}>{data[0].email}</Text>
      </View>

      <Text style={{color:"grey",position:"absolute", top:0, right:0}}>{getTimeDifference(data[0].postdate)}</Text>
    </View>
    
        <Text style={{marginTop:10, fontWeight:"500"}}>Job Title:  
        <Text style={{ fontWeight:"normal"}}> {capitalizeWords(data[0].job_title)}</Text>
        </Text>
        <Text style={{marginTop:5, fontWeight:"500"}}>Description:
        <Text style={{fontWeight:"normal"}}> {data[0].job_description}</Text>
        </Text>
        <Text style={{marginTop:5, fontWeight:"500"}}>Requirements: 
        <Text style={{fontWeight:"normal"}}> {data[0].job_requirements}</Text>
        </Text>
        <Text style={{marginTop:5, fontWeight:"500"}}>Salary:
        <Text style={{fontWeight:"normal"}}> {data[0].job_salary}</Text>
        </Text>
        </>
      )}
      </View>

      <View style={{backgroundColor:"#fff", borderTopWidth:.5, borderColor:"lightgrey"}}>
      <Text style={{fontSize:18, letterSpacing:1, padding:10}}>Applicants</Text>
      </View>

      <View style={{backgroundColor:"#fff", display:"flex", flexDirection:"row", paddingBottom:10}}>
     <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'all' ? '#3a348e' : '#fff'}]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("all")}>
        <Text style={[styles.btnText, { color: selectedOption === 'all' ? '#fff': 'grey' }]}>
        All
        </Text>
      </TouchableHighlight>
      <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'p' ? '#3a348e' : '#fff' }]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("p")}>
        <Text style={[styles.btnText, { color: selectedOption === 'p' ? '#fff': 'grey' }]}>
        Pending
        </Text>
      </TouchableHighlight>
      <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'a' ? '#3a348e' : '#fff' }]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("a")}>
        <Text style={[styles.btnText, { color: selectedOption === 'a' ? '#fff': 'grey' }]}>
        Accept
        </Text>
      </TouchableHighlight>
      <TouchableHighlight style={[styles.btn, { backgroundColor: selectedOption === 'r' ? '#3a348e' : '#fff' }]} underlayColor="#F1F2F6" onPress={() => handleOptionSelect("r")}>
        <Text style={[styles.btnText, { color: selectedOption === 'r' ? '#fff': 'grey' }]}>
        Decline
        </Text>
      </TouchableHighlight>
     </View>

     <View style={{backgroundColor:"#F1F2F6", borderTopWidth:.5, borderColor:"lightgrey"}}>
      <FlatList
        data={userData} // Pass the userData as the data for the FlatList
        renderItem={renderUserItem} // Use the renderUserItem function to render each item
        keyExtractor={(item) => item.id} // Provide a unique key for each item
        maxToRenderPerBatch={4}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    btn:{ 
    borderColor:'#000',
    borderWidth:0.25, 
    borderRadius:5, 
    flex:1,
    marginHorizontal:5
    },
    btn2:{ 
    borderColor:'#3a348e',
    borderWidth:0.25, 
    borderRadius:25, 
    marginHorizontal:5,
    paddingHorizontal:20
    },
    btnText:{
    paddingVertical:10,  
    textAlign:"center", 
    },
    itemContainer: {
        backgroundColor: '#fff',
        marginHorizontal:10,
        marginVertical:5,
        borderRadius: 5,
        marginBottom:0,
        elevation: 2, 
      },
})