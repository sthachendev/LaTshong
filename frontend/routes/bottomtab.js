import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken, setRole } from '../reducers'; 
import Icon from 'react-native-vector-icons/MaterialIcons';

import Home from '../screens/home/home';
import Explore from "../screens/explore/explore";
import Chat from "../screens/chat/chat";
import Profile from "../screens/profile/profile";
import EmployerSearch from "../screens/explore/employerSearch";

import { DrawerToggleButton } from "@react-navigation/drawer";

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
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "Home",
          title: "Dashboard",
          headerTitleAlign:'center',
        }}
      />

      {
        role === 'em' ? 
        <Tab.Screen
        name="Explore"
        component={EmployerSearch}
        options={{
          headerShown: false,
          tabBarLabel:'Search'
        }}
      />
      :
      <Tab.Screen
      name="Explore"
      component={Explore}
      options={{
        headerShown: false,
      }}
    />
      }
      
      {token && (
        <>
          <Tab.Screen
            name="Chat"
            component={Chat}
            options={{
              tabBarLabel: "Message",
              headerTitle: "Message",
              headerTitleAlign:'center',
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
