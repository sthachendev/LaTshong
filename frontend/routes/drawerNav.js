import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useSelector, useDispatch } from 'react-redux';
import { clearToken, clearRole } from '../reducers';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import BottomTab from './bottomtab';
import { DrawerActions } from '@react-navigation/native';
import jwtDecode from 'jwt-decode';

const Drawer = createDrawerNavigator();

export default function DrawerNav({ navigation }) {
  const dispatch = useDispatch();

  const token = useSelector((state)=> state.token);
  const userid = token ? jwtDecode(token).userid : null;
  // const userid = jwtDecode(token).userid;// this giving a getter problem
  // console.log('userid',userid)

  const handleLogout = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
    dispatch(clearToken());
    dispatch(clearRole());
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('role');
  };

  const CustomDrawerContent = (props) => {
    return (
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, marginHorizontal:10 }}>
        <View style={{ flex: 1 }}>
          {/* LaTshong */}
          <View style={{ alignItems: 'center', marginVertical: 20, paddingBottom:20, borderBottomWidth:1, borderColor:"lightgrey"}}>
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

          {/* Drawer items */}
          {/* <DrawerItemList {...props} /> */}
          {token !== null && token && (
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
          )}
       
        <DrawerItem
          label="Home"
          onPress={() => navigation.navigate('Home')}
          icon={({ color, size }) => (
            <Ionicons
              name="home-outline"
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
              name="search-outline"
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
                name="person-outline"
                color={color}
                size={size}
              />
            )}
          />
        )}

        {token !== null && token && (
          <>
            <DrawerItem
             label="Messages"
             onPress={() => navigation.navigate('Chat')}
             icon={({ color, size }) => (
               <Ionicons
                 name="chatbubbles-outline"
                 color={color}
                 size={size}
               />
             )}
           />

          <DrawerItem
            label="Applied Lists"
            onPress={() => navigation.navigate('AppliedLists')}
            icon={({ color, size }) => (
              <Ionicons
                name="file-tray-full-outline"
                color={color}
                size={size}
              />
            )}
          />

          </>
          )}

          <View style={{alignContent: 'center', marginVertical: 20,
          borderBottomWidth:1, borderColor:"lightgrey"}}/>

          {token !== null && token && (
            <DrawerItem
              label="Settings"
              onPress={() => {
                navigation.navigate('Setting', {userid});
                navigation.dispatch(DrawerActions.closeDrawer());
              }}
              icon={({ color, size }) => (
                <Ionicons
                  name="build-outline"
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
                name="help-circle-outline"
                color={color}
                size={size}
              />
            )}
          />

          {/* Spacer */}
          <View style={{ flex: 1 }} />
         
        
        {token !== null && token && (
          <View style={{alignContent: 'center', marginBottom: 20,
            borderBottomWidth:1, borderColor:"lightgrey"}}>
          <DrawerItem
              label="Logout"
              labelStyle={{ color: 'rgba(255,0,0,.5)' }} // Specify the desired label color here
              inactiveBackgroundColor='rgba(255,0,0,.1)'
              onPress={handleLogout}
              style={{ marginVertical: 20 , alignContent:"center",}}
              icon={({ color, size }) => (
                <Ionicons
                  name="log-out"
                  color='rgba(255,0,0,.5)'
                  size={size}
                />
              )}
            />
           
          </View>
          )}

          <Text style={{
           textAlign:"center", marginBottom:20, color:'grey'
          }}>Version 1.0.0</Text>
        
          
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
            name="menu-outline"
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
