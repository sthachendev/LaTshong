import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, FlatList, Dimensions, TouchableOpacity, TextInput, ToastAndroid, TouchableWithoutFeedback
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import config from "../config";
import axios from "axios";

export default ProfilePost = ({navigation, route}) => {

    const {userid} = route.params;

    console.log(userid);

    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [assets, setAssets] = useState([]);
    const [selectedAssets, setSelectedAssets] = useState([]);//selected images
    const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
    const [showPostForm, setShowPostForm] = useState(false);
    const [desc, setDesc] = useState("");

    useEffect(() => {
    (async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === "granted") {
        const albums = await MediaLibrary.getAlbumsAsync();
        setAlbums(albums);
        const assets = await MediaLibrary.getAssetsAsync({ first: 20 });
        setAssets(assets.assets);
        }
    })();
    }, []);

    useEffect(() => {
    (async () => {
        if (selectedAlbum) {
        const assets = await MediaLibrary.getAssetsAsync({
            album: selectedAlbum,
        });
        setAssets(assets.assets);
        } else {
        const assets = await MediaLibrary.getAssetsAsync({ first: 20 });
        setAssets(assets.assets);
        }
    })();
    }, [selectedAlbum, handleGoBack]);

    const handlePress = (asset) => {
    setSelectedAssets((prevSelectedAssets) =>
        prevSelectedAssets.includes(asset)
        ? prevSelectedAssets.filter((a) => a.id !== asset.id)
        : [...prevSelectedAssets, asset]
    );
    };

    const handleGoBack = () => {
    navigation.goBack();
    };

    const handlePost = async () => {
   
        const formData = new FormData(); 
        formData.append("description", desc);
        formData.append("postBy", userid);

        // selectedAssets.forEach((image) => {
        // formData.append("images", image);
        // });

    try {
    const res = await axios.post(`${config.API_URL}/api/post`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        })

    console.log(res)

    } catch (error) {
        console.log(error);
    }
    };

    const renderAsset = ({ item: asset, index }) => {
    const selectedAssetIndex = selectedAssets.findIndex(
        (a) => a.id === asset.id
    );

    return (
        <TouchableOpacity onPress={() => handlePress(asset)} activeOpacity={.7}>
        <Image
            source={{ uri: asset?.uri }}
            style={{
            width: Dimensions.get("window").width / 4 - 2,
            height: Dimensions.get("window").width / 4 - 2,
            margin: 1,
            }}
        />
        {selectedAssets.includes(asset) && (
            <View style={styles.indexCircle}>
            <Text style={styles.indexText}>{selectedAssetIndex + 1}</Text>
            </View>
        )}
        </TouchableOpacity>
    );
    };

    return (
    <>
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
        onPress={
            !showPostForm ? () => setShowPostForm(!showPostForm) : handlePost
        }
        style={{backgroundColor:"#fff",}}
        >
        {selectedAssets.length > 0 && <Text style={styles.buttonText}>

            {showPostForm ? "Post" : "Next"}
        </Text>}
        </TouchableOpacity>
        </View>

        {/* desc */}
        <View style={styles.textContainer}>
            {showPostForm && (
            <TextInput
                placeholder="Write here..."
                style={styles.inputDesc}
                multiline={true}
                value={desc}
                onChangeText={setDesc}
            />
            )}
        </View>

        <View style={{display:"flex", flexDirection:"row", justifyContent:'space-between', margin:10}}>
        {/* back btn for images */}
        {selectedAssets.length > 1 &&
        <TouchableWithoutFeedback 
        onPress={() =>
            setSelectedAssetIndex((prevIndex) =>prevIndex === 0 ? selectedAssets.length - 1 : prevIndex - 1)}>
        <MaterialIcons name="chevron-left" size={36} color="grey" />
        </TouchableWithoutFeedback>
        }
        {/* next */}
        {selectedAssets.length > 1 &&
            <TouchableWithoutFeedback
            onPress={() =>
                setSelectedAssetIndex((prevIndex) =>prevIndex === selectedAssets.length - 1 ? 0 : prevIndex + 1)}>
            <MaterialIcons name="chevron-right" size={36} color="grey" />
            </TouchableWithoutFeedback>}
        </View>

        {/* images display */}
        <View style={styles.assetsContainer}>
            {selectedAssets.length > 0 && (
            <Image
            source={{ uri: selectedAssets[selectedAssetIndex].uri }}
            style={styles.selectedImage}
            />)}
        </View>

        {/* number of images */}
        {selectedAssets.length > 0 && (
        <Text style={{fontSize:12, padding:10}}>
            {selectedAssetIndex + 1}/{selectedAssets.length}
        </Text>
        )}

        <Picker
            selectedValue={selectedAlbum}
            onValueChange={(itemValue) => setSelectedAlbum(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            prompt="Select an album"
            dropdownIconColor="#000"
        >
            <Picker.Item label="Gallery" value={null} />
            {albums.map((album) => (
            <Picker.Item key={album.id} label={album.title} value={album} />
            ))}
        </Picker>

        <FlatList
            data={assets}
            renderItem={renderAsset}
            keyExtractor={(item) => item.id}
            numColumns={4}
        />

        </View>
    </>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    marginVertical:20,
    marginBottom:0
  },
  inputDesc: {
    backgroundColor: "#F1F2F6",
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
