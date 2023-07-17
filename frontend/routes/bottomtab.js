import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken, clearToken, setRole, clearRole } from '../reducers'; 

import Home from '../screens/home/home';
import Explore from "../screens/explore/explore";
import Chat from "../screens/chat/chat";
import Profile from "../screens/profile/profile";

import { DrawerToggleButton } from "@react-navigation/drawer";

const Tab = createBottomTabNavigator();

function BottomTab({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const role = await AsyncStorage.getItem("role");
        if (token) {
          dispatch(setToken(token));
          dispatch(setRole(role));
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    getToken();
  }, [dispatch]);
  
  const token = useSelector((state) => state.token);
  const role = useSelector((state) => state.role);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let outlineIconName;

          if (route.name === "Home") {
            iconName = focused ? "home-sharp" : "home-outline";
          } else if (route.name === "Explore") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Chat") {
            iconName = focused ? "chatbox-ellipses" : "chatbox-ellipses-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
              style={{ outline: !focused ? "auto" : "none" }}
            />
          );
        },
        tabBarActiveTintColor: "#1E319D",
        tabBarInactiveTintColor: "#A0A0A0",
        headerTitleStyle:{
          // color:'#1E319D',
          // fontWeight:'bold'
        },
        headerLeft: () => <DrawerToggleButton />,
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          // title: role === "em" ? "Dashboard" : "Home",
          title: "Home",
          // headerTitleStyle: {
          //   // fontWeight: 'bold',
          // },
          // tabBarLabel: role === "em" ? "Dashboard" : "Home",
          title: "Home",
          headerTitleAlign:'center',
          // headerStyle: {
          //   shadowColor: "black",
          //   shadowOpacity: 0.25,
          //   shadowOffset: {
          //     width: 0,
          //     height: 2,
          //   },
          //   shadowRadius: 4,
          //   elevation: 5,
          // },
        }}
      />

      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          headerShown: false,
        }}
      />

      {token && (
        <>
          <Tab.Screen
            name="Chat"
            component={Chat}
            options={({ navigation }) => ({
              headerStyle: {},
              tabBarLabel: "Message",
              headerTitle: "Message",
              headerTitleAlign:'center',
              // headerStyle: {
              //   shadowColor: "black",
              //   shadowOpacity: 0.25,
              //   shadowOffset: {
              //     width: 0,
              //     height: 2,
              //   },
              //   shadowRadius: 4,
              //   elevation: 5,
              // },
            })}
          />
          <Tab.Screen
            name="Profile"
            component={Profile}
            options={({ navigation }) => ({
              tabBarLabel: "Profile",
              headerShown: true,
              headerTitleAlign:'center',
            })}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

export default BottomTab;
