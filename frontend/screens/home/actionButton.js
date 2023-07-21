// ActionButton.js
import React from 'react';
import { FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ActionButton = ({ visible, onButton1Press, onButton2Press }) => {
  return (
    <>
      {visible && (
        <>
          <FAB
            style={{ position: 'absolute', bottom: 145, right: 15, backgroundColor:'#1E319D', borderRadius:40}}
            icon={() => <Icon name="work-outline" size={24} color="white" />}
            onPress={onButton1Press}
          />
          <FAB
            style={{ position: 'absolute', bottom: 80, right: 15, backgroundColor:'#1E319D', borderRadius:40 }}
            icon={() => <Icon name="post-add" size={24} color="white" />}
            onPress={onButton2Press}
          />
        </>
      )}
    </>
  );
};

export default ActionButton;
