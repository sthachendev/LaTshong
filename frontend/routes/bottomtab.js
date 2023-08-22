import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken, setRole, setUnreadCount } from '../reducers'; 
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
import jwtDecode from "jwt-decode";
import config from "../screens/config";
import axios from "axios";
import * as Notifications from 'expo-notifications';

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

  const getUnreadCount = () => {
    console.log(userid);
    axios
      .get(`${config.API_URL}/api/unread_count/${userid}`)
      .then((res) => {
        console.log('count', res.data);
  
        const hasUnreadMessages = res.data.unreadCount > 0;
  
        // Cancel existing notification by updating the notification ID
        const notificationId = 'id123W'; // Set your unique notification ID
        Notifications.cancelScheduledNotificationAsync(notificationId);
  
        if (hasUnreadMessages) {
          dispatch(setUnreadCount(true));
  
          // Display a notification when there are unread messages
          const notificationContent = {
            title: 'New Message',
            body: 'You have new unread messages.',
          };
  
          Notifications.scheduleNotificationAsync({
            content: notificationContent,
            trigger: null, // Display immediately
            identifier: notificationId, // Use the same notification ID
          });
        } else {
          dispatch(setUnreadCount(null));
        }
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    if (token && role != 'admin') {
      getUnreadCount();
     const interval = setInterval(() => {
      getUnreadCount();
      console.log('fetching count')
    },  60 * 1000);

    return () => clearInterval(interval);
    }

  }, [userid]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;

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
