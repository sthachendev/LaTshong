import { useState } from "react";
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, TextInput, ToastAndroid
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import config from "../config";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';

export default ProfilePost = ({navigation, route}) => {

    const {userid} = route.params;

    const [desc, setDesc] = useState("");
    const [image, setImage] = useState(null);

    const handleGoBack = () => {
    navigation.goBack();
    };

    const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log(result);
  
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    };
    
    const handlePost = async () => {
   
        try {
          const formData = new FormData();
          formData.append('description', desc);
          formData.append('postby', userid);
          formData.append('image', {
            uri: image,
            name: 'image.jpg',
            type: 'image/jpg',
          });
        
          await axios.patch(`${config.API_URL}/api/post`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        
          setDesc("");
          setImage(null);
          handleGoBack();
          ToastAndroid.show("Posted", ToastAndroid.SHORT);
          console.log('posted')
        } catch (error) {
          console.log(error);
        }
    };

    return (
      <View style={styles.container}>

      {/* top close header and next/ post btn */}
      <View style={styles.buttonContainer2}>
      
      <TouchableOpacity style={styles.button} onPress={handleGoBack}>
      <MaterialIcons name="close" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} activeOpacity={1}>
          <Text style={styles.buttonText2}>New Post</Text>
      </TouchableOpacity>

      <TouchableOpacity
      onPress={handlePost}
      style={{backgroundColor:"#fff",}}
      >
      <Text style={styles.buttonText}>
          Post
      </Text>
      </TouchableOpacity>
      </View>

      {/* desc */}
      <View style={styles.textContainer}>
          <TextInput
            placeholder="Write here..."
            style={styles.inputDesc}
            multiline={true}
            value={desc}
            onChangeText={setDesc}
          />
      </View>
      <Text style={{color:"grey", fontSize:14, paddingLeft:10, paddingTop:5}}>Text Limit</Text>

      <View style={{ flex: 1, alignItems: 'center',  }}>

      {image && <Image source={{ uri: image }} 
    style={{ width: "95%", height: 200, borderWidth:1, borderRadius:5, borderColor:'lightgrey', marginTop:25}} />}
    
    <TouchableOpacity title="Pick an image from camera roll" onPress={pickImage} 
    style={{backgroundColor:"#1E319D", padding:10, paddingHorizontal:15, borderRadius:10, elevation:2, marginTop:20}}>
      <Text style={{color:'#fff'}}>Add Image</Text>
    </TouchableOpacity>
    
  </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F2F6",
  },
  buttonContainer2: {
    backgroundColor: "#fff",
    borderBottomWidth:0.5,
    borderBottomColor:"lightgrey",
    padding: 10,
    paddingHorizontal:15,
    width: "100%",
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between"
  },
  buttonText: {
    fontSize: 16,
    color:"#1E319D"
  },
  buttonText2: {
    fontSize: 16,
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop:40,
  },
  inputDesc: {
    backgroundColor: "#fff",
    width: "95%",
    height: 150,
    maxHeight:300,
    paddingLeft: 10,
    paddingTop: 10,
    borderColor: "grey",
    borderRadius: 10,
    justifyContent: "flex-start",
    color: "black",
    textAlignVertical: "top",
    elevation:2
  },
  dropdownContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical:20,
    width:"100%"
  },
  assetsContainer: {
    display: "flex",
    flexDirection: "row",
    backgroundColor:'#000',
    marginHorizontal:10
  },
  selectedImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").width - 200,
    resizeMode: "center"
  },
  indexCircle: {
    position: "absolute",
    top: 7,
    right: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1E319D",
  },
  indexText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  picker: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginBottom: 15,
    height: 40,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 10,
  },
  pickerItem: {
    fontSize: 16,
    color: "#000",
  },
});
