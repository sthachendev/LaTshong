import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, DrawerToggleButton  } from '@react-navigation/drawer';
import { useSelector, useDispatch } from 'react-redux';
import { setToken, clearToken, clearRole } from '../reducers';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile from '../screens/profile/profile';

const Drawer = createDrawerNavigator();

export default function ProfileDrawer() {

    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(clearToken())
        dispatch(clearRole())
        AsyncStorage.removeItem('token');
        AsyncStorage.removeItem('role');
    }
  const CustomDrawerContent = (props) => {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label="Setting"
          onPress={handleLogout}
        />
        <DrawerItem
          label="Logout"
          onPress={handleLogout}
        />
      </DrawerContentScrollView>
    );
  };

  return (
    <Drawer.Navigator drawerContent={CustomDrawerContent}  screenOptions={{
        drawerPosition: 'right',
        headerLeft: false,
        headerRight: () => <DrawerToggleButton />,
    }}> 
      <Drawer.Screen name="Profile" component={Profile} options={{}} />
      {/* Add other screens for the Profile drawer as needed */}
    </Drawer.Navigator>
  );
}
