import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { useSelector, useDispatch } from "react-redux";
import { setToken, setRole, clearToken, clearRole } from "../reducers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Text,
  View,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import BottomTab from "./bottomtab";
import { DrawerActions } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import { capitalizeWords } from "../screens/fn";
import { TouchableHighlight } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useEffect } from "react";

const Drawer = createDrawerNavigator();

export default function DrawerNav({ navigation }) {
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
  const userid = token ? jwtDecode(token).userid : null;
  const username = token ? jwtDecode(token).username : null;

  const role = useSelector((state) => state.role);

  const handleLogout = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
    dispatch(clearToken());
    dispatch(clearRole());
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("role");
    ToastAndroid.show("Log out.", ToastAndroid.SHORT);
  };

  const CustomDrawerContent = (props) => {
    return (
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ flex: 1, marginHorizontal: 10 }}
      >
        <View style={{ flex: 1 }}>
          {/* LaConnect */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text
              style={{
                fontWeight: "bold",
                color: "#152370",
                letterSpacing: 4,
                fontSize: 25,
              }}
            >
              LaConnect
            </Text>
          </View>

          <View
            style={{
              alignContent: "center",
              marginVertical: 20,
              borderBottomWidth: 0.25,
              borderColor: "rgba(49, 105, 210, 0.5)",
            }}
          />

          {token !== null && token && username && (
            <TouchableOpacity
              style={{ display: "flex", flexDirection: "row" }}
              activeOpacity={1}
              onPress={() => role != "admin" && navigation.navigate("Profile")}
            >
              <View style={{ marginLeft: 20 }}>
                <Text style={{ fontWeight: "500" }}>
                  {capitalizeWords(username)}
                </Text>
                <Text style={{ color: "grey" }}>
                  {role === "em" && "Employer"}
                  {role === "js" && "Job Seeker"}
                  {role === "admin" && "Admin"}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View
            style={{
              alignContent: "center",
              marginVertical: 20,
              borderBottomWidth: 0.25,
              borderColor: "rgba(49, 105, 210, 0.5)",
            }}
          />

          {token === null && (
            <DrawerItem
              label="Login"
              onPress={() => {
                navigation.navigate("Login");
                navigation.dispatch(DrawerActions.closeDrawer());
              }}
              icon={({ color, size }) => (
                <Icon name="person" color={color} size={size} />
              )}
            />
          )}

          {role !== "admin" && (
            <>
              <DrawerItem
                label="Dashboard"
                onPress={() => navigation.navigate("Home")}
                icon={({ color, size }) => (
                  <Icon name="dashboard" color={color} size={size} />
                )}
              />
              <DrawerItem
                label={role != "em" ? "Explore" : "Search"}
                onPress={() => navigation.navigate("Explore")}
                icon={({ color, size }) => (
                  <Icon
                    name={role != "em" ? "explore" : "search"}
                    color={color}
                    size={size}
                  />
                )}
              />
            </>
          )}

          {token !== null && token && role !== "admin" && (
            <>
              <DrawerItem
                label="Message"
                onPress={() => navigation.navigate("Chat")}
                icon={({ color, size }) => (
                  <Icon name="chat" color={color} size={size} />
                )}
              />
            </>
          )}

          {role === "js" && (
            <DrawerItem
              label="Saved Job Post"
              onPress={() => navigation.navigate("SavedPosts")}
              icon={({ color, size }) => (
                <Icon name="bookmark" color={color} size={size} />
              )}
            />
          )}
          {/* for employer job posts */}

          {token !== null && token && (
            <>
              <View
                style={{
                  alignContent: "center",
                  marginVertical: 20,
                  borderBottomWidth: 0.25,
                  borderColor: "rgba(49, 105, 210, 0.5)",
                }}
              />

              <DrawerItem
                label="Settings"
                onPress={() => {
                  navigation.navigate("Setting", { userid, role });
                  navigation.dispatch(DrawerActions.closeDrawer());
                }}
                icon={({ color, size }) => (
                  <Icon name="settings" color={color} size={size} />
                )}
              />
            </>
          )}

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {token !== null && token && (
            <View
              style={{
                alignContent: "center",
                justifyContent: "center",
                flexDirection: "row",
                marginBottom: 20,
              }}
            >
              <TouchableHighlight
                onPress={handleLogout}
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderRadius: 25,
                  paddingHorizontal: 20,
                }}
                underlayColor="rgba(49, 105, 210, 0.5)"
              >
                <>
                  <Ionicons name="power" color="#3E56C5" size={20} />
                  <Text style={{ marginLeft: 10, color: "#3E56C5" }}>
                    Log Out
                  </Text>
                </>
              </TouchableHighlight>
            </View>
          )}

          <Text
            style={{ textAlign: "center", marginBottom: 20, color: "grey" }}
          >
            Version 1.0.0
          </Text>
        </View>
      </DrawerContentScrollView>
    );
  };

  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        drawerPosition: "left",
        headerShown: false,
        drawerIcon: ({ color, size }) => (
          <Ionicons name="menu" color={color} size={size} />
        ),
      }}
    >
      <Drawer.Screen name="BottomTab" component={BottomTab} />
    </Drawer.Navigator>
  );
}
