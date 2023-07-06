import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector, useDispatch } from 'react-redux';

import Home from '../screens/home/home';
import Explore from "../screens/explore/explore";
import Profile from "../screens/profile/profile";
import Post from "../screens/post/post";
import Chat from "../screens/chat/chat";
import Login from "../screens/auth/login";

import ProfileDrawer from "./drawer";

const Tab = createBottomTabNavigator();

function BottomTab({ navigation }) {

  const token = useSelector((state) => state.token);
  const role = useSelector((state) => state.role);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#3a348e", // Change the color to your desired color
        tabBarInactiveTintColor:'#c0c0c0'
      }}
    >
    <Tab.Screen
      name="Home"
      component={Home}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" size={size} color={color} />
        ),
        title:"LaTshong",
        headerStyle: {
          // backgroundColor: '#3a348e',
          // borderBottomRightRadius: 20,
          // borderBottomLeftRadius: 20,
        },
        // headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarLabel:"Home"
      }}
    />

    {role === "em" ? 
    <Tab.Screen
    name="Explore"
    component={Explore}
    options={{
      tabBarIcon: ({ color, size }) => (
        <MaterialIcons name="explore" size={size} color={color} />
      ),
      headerShown: true,
    }}
  />:
<Tab.Screen
    name="Explore"
    component={Explore}
    options={{
      tabBarIcon: ({ color, size }) => (
        <MaterialIcons name="explore" size={size} color={color} />
      ),
      headerShown: true,
    }}
  />
    }

    {token ? 
    <>
    {role === "em" && role !=="js" &&
       <Tab.Screen
       name="Post"
       component={Post}
       options={{
         tabBarIcon: ({ color, size }) => (
           <MaterialIcons name="add-box" size={size} color={color} />
         ),
         // title:"New Post",
         // tabBarLabel:"Post",
         headerShown:true
       }}
     />
    }
    
    <Tab.Screen
      name="Chat"
      component={Chat}
      options={({ navigation }) => ({
        headerStyle: {},
        tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="chat"
              size={size}
              color={color}
            />
        ),
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
        // headerLeft: () => (
        //   <TouchableOpacity
        //     style={{ marginLeft: 16 }}
        //     onPress={() => navigation.toggleDrawer()}
        //   ></TouchableOpacity>
        // ),
        headerShown:false
      })}
    />
    </>:
      <Tab.Screen
      name="Profile"
      component={Login}
      options={({ navigation }) => ({
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person" size={size} color={color} />
        ),
        // headerLeft: () => (
        //   <TouchableOpacity
        //     style={{ marginLeft: 16 }}
        //     onPress={() => navigation.toggleDrawer()}
        //   ></TouchableOpacity>
        // ),
        headerShown:false
      })}
    />
    }
          
          
    
    </Tab.Navigator>
  );
}

export default BottomTab;
