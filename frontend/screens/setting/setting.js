import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";

export default function Setting({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveChanges = () => {
    // TODO: Add logic to save changes
    if (newPassword !== confirmPassword) {
      // TODO: Show error message that passwords don't match
      return;
    }

    // TODO: Add logic to update the password

    // Redirect or navigate to another screen
    navigation.navigate("Home");
  };

  return (
    <View>
      <Text>Hello, this is the Setting.js</Text>
      
      <Text>Current Password</Text>
      <TextInput
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      <Text>New Password</Text>
      <TextInput
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <Text>Confirm New Password</Text>
      <TextInput
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

<Button title="Save Changes" onPress={handleSaveChanges} />
<Button title="Save Changes" onPress={handleSaveChanges} />
    </View>
  );
}
