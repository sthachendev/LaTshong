import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import BottomTab from "./bottomtab";
import Setting from "../screens/setting/setting";
import Post from "../screens/post/post";
import PostDetails from "../screens/post/postDetails";  
import chatRoom from "../screens/chat/chatRoom";
import ViewProfile from "../screens/profile/viewProfile";
import ProfilePost from "../screens/post/profilePost";
import Login from "../screens/auth/login";
import Signup from "../screens/auth/signup";
import SignupStep2 from "../screens/auth/signupStep2";
import DrawerNav from "./drawerNav";
import Support from "../screens/support/support";

function Stack() {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          animationEnabled: false,
          headerStyle: {
            shadowColor: "black",
            shadowOpacity: 0.25,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowRadius: 4,
            elevation: 5,
          },
        }}
      >
        <Stack.Screen
          name="DrawerNav"
          component={DrawerNav}
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
            headerTitle: "Job Details",
            headerTitleAlign: "center",
          }}
        />
       <Stack.Screen
          name="ViewProfile"
          component={ViewProfile}
          options={{
            headerShown: true,
            headerTitle:"Post",
            headerTitleAlign:"center"
          }}
        />

      <Stack.Screen
        name="ChatRoom"
        component={chatRoom}
        // options={{
        //   headerShown: true,
        //   headerTitle:"ChatRoom",
        //   headerTitleAlign:"center"
        // }}
        options={({ route }) => ({ 
          headerTitle: route.params.title,
        headerTitleAlign:"center"
        })}

      />

      <Stack.Screen
          name="ProfilePost"
          component={ProfilePost}
          options={{
            headerShown: false,
            // headerTitle:"Add New Post"
          }}
        />

      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
          // headerTitle:"Add New Post"
        }}
      />

      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{
          headerShown: false,
          // headerTitle:"Add New Post"
        }}
      />

      <Stack.Screen
        name="SignupStep2"
        component={SignupStep2}
        options={{
          headerShown: false,
          // headerTitle:"Add New Post"
        }}
      />

      <Stack.Screen
        name="Setting"
        component={Setting}
        options={{
          headerShown: true,
          // headerTitle:"Add New Post"
        }}
      />

      <Stack.Screen
        name="Support"
        component={Support}
        options={{
          headerShown: true,
          // headerTitle:"Add New Post"
        }}
      />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Stack;
