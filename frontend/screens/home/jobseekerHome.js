import { View, Text } from "react-native";
import { useSelector, useDispatch } from 'react-redux';

export default JobseekerHome = ({token, role}) => {

    return(
        <View>
            <Text>
                Hello this is the JobseekerHome.js, n token : {token}
            </Text>
            <Text>
              role is {role}
            </Text>
        </View>
    )
}