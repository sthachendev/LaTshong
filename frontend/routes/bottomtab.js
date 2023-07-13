import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken, clearToken, setRole, clearRole } from '../reducers'; 

import Home from '../screens/home/home';
import Explore from "../screens/explore/explore";
import Chat from "../screens/chat/chat";
import Login from "../screens/auth/login";

import ProfileDrawer from "./drawer";

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
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#1E319D", // Change the color to your desired color
        tabBarInactiveTintColor:'#A0A0A0'
      }}
    >
    <Tab.Screen
      name="Home"
      component={Home}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" size={size} color={color} />
        ),
        title:"Home",
        headerStyle: {
          // backgroundColor: '#3a348e',
          // borderBottomRightRadius: 20,
          // borderBottomLeftRadius: 20,
        },
        // headerTintColor: '#4942E4',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarLabel:"Home",
      }}
    />

    <Tab.Screen
    name="Explore"
    component={Explore}
    options={{
      tabBarIcon: ({ color, size }) => (
        <MaterialIcons name="explore" size={size} color={color} />
      ),
      headerShown: false,
    }}
  />

    {token &&
    <>
    <Tab.Screen
      name="Chat"
      component={Chat}
      options={({ navigation }) => ({
        headerStyle: {},
        tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="mail"
              size={size}
              color={color}
            />
        ),
        tabBarLabel:"Message",
        headerTitle:"Messages"
      })}
    />
    <Tab.Screen
      name="ProfileDrawer"
      component={ProfileDrawer}
      options={({ navigation }) => ({
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person" size={size} color={color} />
        ),
        tabBarLabel:'Profile',
        headerShown:false
      })}
    />
    </>
    }
          
          
    
    </Tab.Navigator>
  );
}

export default BottomTab;
