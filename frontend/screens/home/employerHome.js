import { View, Text } from "react-native";
import { useSelector, useDispatch } from 'react-redux';

export default EmployerHome = ({token, role}) => {

    return(
        <View>
            <Text>
                Hello this is the EmployerHome.js, n token : {token}
            </Text>
            <Text>
              role is {role}
            </Text>
        </View>
    )
}