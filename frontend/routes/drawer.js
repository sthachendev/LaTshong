import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, DrawerToggleButton  } from '@react-navigation/drawer';
import { useSelector, useDispatch } from 'react-redux';
import { setToken, clearToken, clearRole } from '../reducers';
const Drawer = createDrawerNavigator();

export default function ProfileDrawer() {

    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(clearToken())
        dispatch(clearRole())
    }
  const CustomDrawerContent = (props) => {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
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
