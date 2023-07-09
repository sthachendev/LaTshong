import { View, Text, Button, TextInput } from 'react-native';

const Chat = ({navigation}) => {

  return (
    <View>
      <Text>
        Hello, this is the Chat.js
      </Text>
      {/* <Button title="Chatroom" onPress={() => navigation.navigate('ChatRoom')} /> */}
    </View>
  );
};

export default Chat;
