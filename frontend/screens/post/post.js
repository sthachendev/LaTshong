import { StyleSheet, Text, View, TextInput, Keyboard, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { RefreshControl } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

const Post = ({ navigation }) => {
 
  const [ItemDesc, setItemDesc] = useState('');

  const [image, setImage] = useState(null);
  const [upload, setUpload] = useState(false);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    const source = {uri: result.uri};
    setImage(source);

  };

//   const uploadImage = async () => {
//     setUpload(true);
//     const response = await fetch(image.uri)
//     const blob = await response.blob();
//     const filename = image.uri.substring(image.uri.lastIndexOf('/')+1);
//     var ref = firebase.storage().ref('posts/'+auth.currentUser.email+'/').child(filename).put(blob);
//     //this get the url for image to display in the home tab
    
//     try {
//       await ref;
//       var url = await firebase.storage().ref('posts/'+auth.currentUser.email+'/'+filename).getDownloadURL();
//       addField(url);

//     } catch (error) {
//       console.log(error);
//     }
  
//     setUpload(false);
//     setImage(null);
  
//   }

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

    return (
      <ScrollView 
      style={styles.container}
      contentContainerStyle={
        {
          justifyContent: 'center',
          alignItems:'center'
        }
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />}
      >
        <View
        style={{
          borderWidth:0,
          width:'100%',
          justifyContent:'center',
          alignItems:'center',
          backgroundColor:'#4942E4',
          borderBottomLeftRadius:25,
          borderBottomRightRadius:25,
          height:60,
        }}
        >
        </View>
  
        {/* this is for the item name and desc */}
        <View
        elevation={5}
        style={{
          borderWidth:0,
          width:'100%',
          flex:.25,
          justifyContent:'center',
          alignItems:'center',
          backgroundColor:'white',
          marginTop: -20,
          width:'90%',
          borderRadius:20,
          paddingBottom:20,
          paddingTop:20,
  
        }}
        >

          <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection:'row'}}>

          {ItemDesc? <Icon size={20} color='orange' name='ios-reader-outline' style={{ paddingRight:220, position:'absolute'} }/>
          : <Icon size={20} color='grey' name='ios-reader-outline' style={{ paddingRight:220, position:'absolute' }}/>}

            <TextInput 
            placeholder='Type item desc here' 
            style={styles.inputDesc}
            onChangeText={(itemDesc) => setItemDesc(itemDesc)}
            value={ItemDesc}
            multiline={true}
            />
          </View>
  
  
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>

            <TouchableOpacity onPress={pickImage} style={{borderColor:'grey', padding:8, borderWidth:.5,
            marginBottom:20, borderRadius:5,marginTop:20, flexDirection:'row'}}>

                {image?<Icon size={20} color='orange' name='ios-image-outline'/>:<Icon size={20} color='grey' name='ios-image-outline'/>}
                {!image?<Text style={{color:'grey', paddingLeft:10}}>Upload Image</Text>:<Text style={{color:'grey', paddingLeft:10}}>Change Image</Text>}

            </TouchableOpacity>
            
            {image && <Image source={{ uri: image.uri }} style={{ width: 300, height: 200, borderWidth:1, borderRadius:5, borderColor:'white',}}/>}
            </View>
  
      </View>
  
       <View style={{marginBottom:25, justifyContent:'center', alignItems:'center', width:'100%',}}>

       <TouchableOpacity 
       onPress={() => {uploadImage();}}
       style={styles.btn}>

        <Icon size={20} color='white' name='md-cloud-upload-outline'/> 

        <Text style={{color:'white', paddingLeft:10}}>Post</Text>

       </TouchableOpacity>
       </View>
       
      </ScrollView>
    );

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  input:{
    width: '70%',
    height: 40,
    paddingLeft:35,
    marginTop: 20,
    borderColor:'darkgray',
    borderRadius:10,
    borderWidth:1,
    borderBottomWidth:1,
    justifyContent:'center',
    alignItems:'center',
    color:'grey'
    
  },
  inputDesc: {
    borderWidth: 1, 
    width: '70%',
    height: 130,
    paddingLeft:35,
    paddingTop:0,
    marginTop: 15,
    marginBottom:15,
    borderColor:'darkgray',
    borderRadius:10,
    justifyContent:'flex-start',
    color:'grey'
  },
  btn: {
    borderWidth:0,
    flexDirection:'row',
    width: '30%',
    padding: 7,
    height: 40,
    borderRadius:10,
    borderColor:'#25D366',
    borderWidth:.3,
    alignItems:'center',
    justifyContent:'center',
    height:45,
    backgroundColor:'black',
    marginTop:40,
   },
   icon:{
    paddingTop:20, paddingRight:220, position:'absolute'
  }
  
});

export default Post;