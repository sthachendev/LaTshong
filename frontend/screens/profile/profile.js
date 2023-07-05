import { View, Text, Button } from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { setToken, clearToken, clearRole } from '../../reducers';

export default Profile = () => {

    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(clearToken())
        dispatch(clearRole())
    }
    return(
        <View>
            <Text>
                Hello this is the Profile.js 
            </Text>
            <Button onPress={handleLogout} title="Logout"></Button>
        </View>
    )
}