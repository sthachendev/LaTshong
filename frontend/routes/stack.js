import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import BottomTab from "./bottomtab";
import Setting from "../screens/setting/setting";
import Post from "../screens/post/post";
import PostDetails from "../screens/post/postDetails";  

function Stack() {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          animationEnabled: false,
        }}
      >
        <Stack.Screen
          name="BottomTab"
          component={BottomTab}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Post"
          component={Post}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PostDetails"
          component={PostDetails}
          options={{
            headerShown: true,
            headerTitle:"Post",
            headerTitleAlign:"center"
          }}
        />
      
      <Stack.Screen
          name="Setting"
          component={Setting}
          options={{
            headerShown: true,
            headerTitle:"Edit Profile"
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Stack;
