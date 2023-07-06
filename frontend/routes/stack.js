import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import BottomTab from "./bottomtab";
import { createStackNavigator } from "@react-navigation/stack";
import Setting from "../screens/setting/setting";

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
          name="Setting"
          component={Setting}
          options={{
            headerShown: true,
            headerTitle:"Edit Profile"
          }}
        />
      
        {/* <Stack.Screen
          name="AdminDrawer"
          component={AdminDrawer}
          options={{
            headerShown: false,
          }}
        /> */}
      
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Stack;
