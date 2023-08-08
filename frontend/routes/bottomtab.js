import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken, setRole, setUnreadCount, clearUnreadCount } from '../reducers'; 
import Icon from 'react-native-vector-icons/MaterialIcons';

import Home from '../screens/home/home';
import Explore from "../screens/explore/explore";
import Chat from "../screens/chat/chat";
import Profile from "../screens/profile/profile";
import EmployerSearch from "../screens/explore/employerSearch";

import { DrawerToggleButton } from "@react-navigation/drawer";
import adminHome from "../screens/admin/adminHome";
import contentManagement from "../screens/admin/contentManagement";
import userManagement from "../screens/admin/userManagement";
import createSocket from "../screens/socketConfig";
import jwtDecode from "jwt-decode";
import config from "../screens/config";
import axios from "axios";

const Tab = createBottomTabNavigator();

function BottomTab() {
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
  const userid = token ? jwtDecode(token).userid : null;

  const unread_count = useSelector((state) => state.unread_count)

  const socket = createSocket(token);

  const getUnreadCount = () => {
    console.log(userid)
    axios.get(`${config.API_URL}/api/unread_count/${userid}`)
    .then(res=>{
      console.log('count',res.data)
      if (res.data.unreadCount > 0 ) {
        dispatch(setUnreadCount(true))
      } else { 
        dispatch(setUnreadCount(null))
      }
    })
    .catch(e=>console.log(e))
  }

  useEffect(() => {
    getUnreadCount()
    // socket.connect();

    // socket.emit('joinChat', { user1:userid, user2:0});

    // // Listen for the 'roomJoined' event to receive the room ID from the backend
    // socket.on('roomJoined', (data) => {
    //     const { roomId } = data;
    //     console.log(`Joined chat room with room ID: ${roomId}`);
    //     // setRoomId(roomId); // Update the component state with the room ID
        
    //   // socket.emit('markRoomMessagesAsRead', { roomId, userid });
    //   // socket.emit('UnReadMessage', { userid });
    //   console.log(`Joined chat room with room ID: ${roomId}`);
    // });

    //establist a socket connection
    // socket.emit('connectUser')

    // socket.emit('UnReadMessage', { userid });

    // socket.on('UnReadMessageResult', (unreadCount) => {

    //   console.log('data', unreadCount);
    //   if (unreadCount > 0) {
    //   // setUnreadMessages(true);
    //   dispatch(setUnreadCount(true))
    //   console.log('unread msg')
    //   } else {
    //   // setUnreadMessages(null);
    //   dispatch(clearUnreadCount())
    //   console.log('all read msg')
    //   }
    // });
  }, [userid, dispatch]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let outlineIconName;

          if (route.name === "Home") {
            iconName='dashboard'
          } else if (route.name === "Explore") {
            if (role === 'em'){
              iconName = 'search';
            }else{
              iconName = 'explore';
            }
          } else if (route.name === "Chat") {
            iconName = 'chat';
          } else if (route.name === "Profile") {
            iconName = 'person';
          } else if (route.name === "UserManagement") {
            iconName = 'people';
          }else if (route.name === "ContentManagement") {
            iconName = 'folder';
          }

          return (
            <Icon
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#1E319D",
        tabBarInactiveTintColor: "#A0A0A0",
        headerLeft: () => <DrawerToggleButton />,
      })}
    >
    {role === 'admin' &&//admin home
       <>
        <Tab.Screen
          name="Home"
          component={adminHome}
          options={{
            title: "Admin Dashboard",
            headerTitleAlign:'center',
          }}
        />
        <Tab.Screen
          name="UserManagement"
          component={userManagement}
          options={{
            title: "User Management",
            headerTitleAlign:'center',
          }}
        />
       <Tab.Screen
          name="ContentManagement"
          component={contentManagement}
          options={{
            title: "Content Management",
            headerTitleAlign:'center',
          }}
        />
       </>
    }
     
     {role !== 'admin' && //home
       <Tab.Screen
       name="Home"
       component={Home}
       options={{
         title: "Dashboard",
         headerTitleAlign:'center',
       }}
     />
     }

      {//em explore
        role === 'em' && 
        <Tab.Screen
        name="Explore"
        component={EmployerSearch}
        options={{
          headerShown: false,
          tabBarLabel:'Search'
        }}
      />
      }

      {//js explore
        role !== 'admin' && role !== 'em' && 
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          headerShown: false,
        }}
      />
      }
      
      {/* message and profile tab */}
      {token && role !== 'admin' && (
        <>
          <Tab.Screen
            name="Chat"
            component={Chat}
            options={{
              tabBarLabel: "Message",
              headerTitle: "Message",
              headerTitleAlign:'center',
              tabBarBadge: unread_count,
              tabBarBadgeStyle: {
                minWidth: 12,
                maxHeight: 12,
                borderRadius: 6,
                fontSize: 10,
                lineHeight: 13,
                alignSelf: undefined,
                borderColor:'#fff',
                borderWidth:2
              },
            }}
          />
          <Tab.Screen
            name="Profile"
            component={Profile}
            options={{
              tabBarLabel: "Profile",
              headerShown: true,
              headerTitleAlign:'center',
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

export default BottomTab;
