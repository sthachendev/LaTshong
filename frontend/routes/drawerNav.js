import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useSelector, useDispatch } from 'react-redux';
import { clearToken, clearRole } from '../reducers';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, ToastAndroid, Image, TouchableOpacity } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import BottomTab from './bottomtab';
import { DrawerActions } from '@react-navigation/native';
import jwtDecode from 'jwt-decode';
import config from '../screens/config';
import { capitalizeWords } from '../screens/fn';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableHighlight } from 'react-native';

const Drawer = createDrawerNavigator();

export default function DrawerNav({ navigation }) {
  const dispatch = useDispatch();

  const token = useSelector((state)=> state.token);
  const userid = token ? jwtDecode(token).userid : null;
  const imageurl = token ? jwtDecode(token).imageurl : null;
  const username = token ? jwtDecode(token).username : null;

  const role = useSelector(state => state.role);
  // const userid = jwtDecode(token).userid;// this giving a getter problem
  // console.log('userid',userid)

  const handleLogout = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
    dispatch(clearToken());
    dispatch(clearRole());
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('role');
    ToastAndroid.show("Log out", ToastAndroid.SHORT);
  };

  const CustomDrawerContent = (props) => {
    return (
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, marginHorizontal:10 }}>
        <View style={{ flex: 1 }}>
          {/* LaTshong */}
          <View style={{ alignItems: 'center', marginTop: 20}}>
            <Text
              style={{
                fontWeight: 'bold',
                color: '#152370',
                letterSpacing: 4,
                fontSize: 25,
              }}
            >
              LaTshong
            </Text>
          </View>

          <View style={{alignContent: 'center', marginVertical: 20, borderBottomWidth:.25, borderColor:"rgba(49, 105, 210, 0.5)"}}/>
          
          {token !== null && token && imageurl && username &&
            <TouchableOpacity style={{display:'flex', flexDirection:'row'}} activeOpacity={1}
             onPress={() => navigation.navigate('Profile')}>
              <Image source={{ uri: `${config.API_URL}/${imageurl}` }} style={{width:50, height:50, borderRadius:25}} />
                <View style={{marginLeft:20}}>
                  <Text style={{fontWeight:'500',}}>{capitalizeWords(username)}</Text>
                  <Text>
                  {role === 'em' && 'Employer'}
                  {role === 'js' && 'Job Seeker'}
                  </Text>
                </View>
            </TouchableOpacity>
          }

          <View style={{alignContent: 'center', marginVertical: 20, borderBottomWidth:.25, borderColor:"rgba(49, 105, 210, 0.5)"}}/>

          {/* Drawer items */}
          {/* <DrawerItemList {...props} /> */}
          {/* {token !== null && token && (
             <DrawerItem
             label="Profile"
             onPress={() => navigation.navigate('Profile')}
             icon={({ color, size }) => (
               <Ionicons
                 name="person-outline"
                 color={color}
                 size={size}
               />
             )}
           />
          )} */}
       
        <DrawerItem
          label="Home"
          // labelStyle={{color:'#000'}}
          onPress={() => navigation.navigate('Home')}
          icon={({ color, size }) => (
            <Ionicons
              name="home-sharp"
              color={color}
              size={size}
            />
          )}
        />
        <DrawerItem
          label="Explore"
          onPress={() => navigation.navigate('Explore')}
          icon={({ color, size }) => (
            <Ionicons
              name="search"
              color={color}
              size={size}
            />
          )}
        />

        {token === null && (
          <DrawerItem
            label="Login"
            onPress={() => {
              navigation.navigate('Login');
              navigation.dispatch(DrawerActions.closeDrawer());
            }}
            icon={({ color, size }) => (
              <Ionicons
                name="person"
                color={color}
                size={size}
              />
            )}
          />
        )}

        {token !== null && token && (
          <>
            <DrawerItem
             label="Message"
             onPress={() => navigation.navigate('Chat')}
             icon={({ color, size }) => (
               <Ionicons
                 name="chatbox-ellipses"
                 color={color}
                 size={size}
               />
             )}
           />

          </>
          )}

          {role === 'js' && 
            <DrawerItem
            label="Applied Lists"
            onPress={() => navigation.navigate('AppliedLists')}
            icon={({ color, size }) => (
              <Ionicons
                name="file-tray-full"
                color={color}
                size={size}
              />
            )}
          />
          }

          <View style={{alignContent: 'center', marginVertical: 20,
          borderBottomWidth:.25, borderColor:"rgba(49, 105, 210, 0.5)"}}/>

          {token !== null && token && (
            <DrawerItem
              label="Settings"
              onPress={() => {
                navigation.navigate('Setting', {userid});
                navigation.dispatch(DrawerActions.closeDrawer());
              }}
              icon={({ color, size }) => (
                <Ionicons
                  name="build"
                  color={color}
                  size={size}
                />
              )}
            />
          )}
          <DrawerItem
            label="Help & Support"
            onPress={() => {
              navigation.navigate('Support');
              navigation.dispatch(DrawerActions.closeDrawer());
            }}
            icon={({ color, size }) => (
              <Ionicons
                name="help-circle"
                color={color}
                size={size}
              />
            )}
          />

          {/* Spacer */}
          <View style={{ flex: 1 }} />
         
        
        {token !== null && token && (
          <View style={{alignContent: 'center', justifyContent:'center', flexDirection:'row', marginBottom:20 }}>
          <TouchableHighlight onPress={handleLogout} style={{flexDirection:'row', padding:10, borderRadius:25, paddingHorizontal:20}}
           underlayColor='rgba(49, 105, 210, 0.5)'>
          <>
          <Ionicons
            name="power"
            color='#3E56C5'
            size={20}
          />
          <Text style={{ marginLeft:10, color:'#3E56C5' }}>Log Out</Text>
          </>
          </TouchableHighlight>
          </View>
          )}
          {/* <View style={{alignContent: 'center', marginVertical: 20, borderBottomWidth:.25, borderColor:"lightgrey"}}/> */}

          <Text style={{ textAlign:"center", marginBottom:20, color:'grey' }}>Version 1.0.0</Text>
          
        </View>
      </DrawerContentScrollView>
    );
  };

  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        drawerPosition: 'left',
        headerShown: false,
        drawerIcon: ({ color, size }) => (
          <Ionicons
            name="menu"
            color={color}
            size={size}
          />
        ),
      }}
    >
      <Drawer.Screen name="BottomTab" component={BottomTab} />
    </Drawer.Navigator>
  );
}
