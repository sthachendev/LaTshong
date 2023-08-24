import React, { useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { TextInput, Text, Switch, Checkbox } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TouchableHighlight } from "react-native";
import { ScrollView } from "react-native";
import { validateInput } from "../fn";
import axios from "axios";
import config from "../config";

export default function Signup({ navigation }) {
  const [firsName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState("js");

  const [hide, setHide] = useState(false);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  const [message, setMessage] = useState("");

  const [isToggled, setToggle] = useState(true);
  const [checked, setChecked] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setToggle(!isToggled);

    if (!isToggled) {
      setRole("js");
    } else {
      setRole("em");
    }
  };

  const handleNext = () => {
    setMessage("");

    let name;

      if (middleName.trim() !== "") {
        name = firsName + " " + middleName + " " + lastName;
        console.log(name)
      } else {
        name = firsName + " " + lastName;
        console.log(name)
      }

    if (
      email.trim() !== "" &&
      validateInput(name) &&
      password.length >= 6 &&
      password.trim() !== "" && confirmPassword === password &&
      confirmPassword.trim() !== "" &&
      checked === true
    ) {

      const data = {
        email: email.trim(),
        name: name,
        password,
        role,
      };
      setLoading(true);

      axios
        .post(`${config.API_URL}/api/otp`, { email })
        .then((response) => {
          if (response.data.success) {
            navigation.navigate("SignupStep2", {
              email,
              validOtp: response.data.otp,
              data,
            });
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      email.trim() === "" ||
      name.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      setMessage("Fill up the form.");
    } else if (firsName === "") {
      setMessage("Enter your name.");
    } else if (validateInput(name) === false) {
      setMessage(
        "Invalid characters in name, specials characters are not allowed."
      );
    } else if (password !== "" && password !== confirmPassword) {
      setMessage("Password doesn't match, check the password.");
    } else if (checked !== true) {
      setMessage("Check the checkbox.");
    } else if (password.length < 6) {
      setMessage("Password must be atleast 6 characters.");
    }
  };

  const handleShowPassword = () => {
    if (isPasswordSecure) {
      setHide(true);
      setIsPasswordSecure(false);
    } else {
      setHide(false);
      setIsPasswordSecure(true);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: "#fff", flex: 1 }}>
      <TouchableHighlight
        onPress={() => navigation.goBack()}
        underlayColor="#fff"
        style={{ marginTop: 10, padding: 10 }}
      >
        <MaterialIcons name="arrow-back" size={24} color="#152370" />
      </TouchableHighlight>

      <Text
        style={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#152370",
          letterSpacing: 4,
          fontSize: 25,
          paddingBottom: 10,
        }}
      >
        LaConnect
      </Text>

      <View style={styles.container}>
        <View style={{ marginHorizontal: 10, marginBottom: 5 }}>
          <Text
            style={{
              color: "grey",
            }}
          >
            Sign up to create an account
          </Text>
        </View>

        {message !== "" && message && (
          <>
            <View
              style={{
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                borderRadius: 2,
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: "rgba(255, 0, 0, 0.5)",
                  fontWeight: "300",
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
            </View>
          </>
        )}

        <TextInput
          mode="outlined"
          label="First name"
          value={firsName}
          onChangeText={setFirstName}
          onFocus={() => setMessage("")}
          style={{ fontSize: 14, marginTop: 10 }}
          theme={{
            colors: {
              primary: "#4942E4",
              background: "#fff",
              outline: "lightgrey",
            },
          }}
        />

        <TextInput
          mode="outlined"
          label="Middle name"
          value={middleName}
          onChangeText={setMiddleName}
          onFocus={() => setMessage("")}
          style={{ fontSize: 14, marginTop: 10 }}
          theme={{
            colors: {
              primary: "#4942E4",
              background: "#fff",
              outline: "lightgrey",
            },
          }}
        />
        <TextInput
          mode="outlined"
          label="Last name"
          value={lastName}
          onChangeText={setLastName}
          onFocus={() => setMessage("")}
          style={{ fontSize: 14, marginTop: 10 }}
          theme={{
            colors: {
              primary: "#4942E4",
              background: "#fff",
              outline: "lightgrey",
            },
          }}
        />

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setMessage("")}
          style={{ fontSize: 14, marginTop: 10 }}
          theme={{
            colors: {
              primary: "#4942E4",
              background: "#fff",
              outline: "lightgrey",
            },
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: !isToggled ? "grey" : "#000" }}>
            Job Seeker
          </Text>
          <Switch
            value={isToggled}
            onValueChange={handleToggle}
            color="#3a348e"
          />

          <Text style={{ color: isToggled ? "grey" : "#000" }}>Employer</Text>
          <Switch
            value={!isToggled}
            onValueChange={handleToggle}
            color="#3a348e"
          />
        </View>

        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onFocus={() => setMessage("")}
          onChangeText={setPassword}
          secureTextEntry={isPasswordSecure}
          right={
            <TextInput.Icon
              icon={hide ? "eye" : "eye-off"}
              onPress={handleShowPassword}
            />
          }
          style={{ fontSize: 14, marginTop: 10 }}
          theme={{
            colors: {
              placeholder: "#000",
              text: "#000",
              primary: "#4942E4",
              underlineColor: "transparent",
              background: "#fff",
              outline: "lightgrey",
            },
          }}
        />
        <TextInput
          mode="outlined"
          label=" Confirm Password"
          value={confirmPassword}
          onFocus={() => setMessage("")}
          onChangeText={setConfirmPassword}
          secureTextEntry={isPasswordSecure}
          right={
            <TextInput.Icon
              icon={hide ? "eye" : "eye-off"}
              onPress={handleShowPassword}
            />
          }
          style={{ fontSize: 14, marginTop: 10 }}
          theme={{
            colors: {
              placeholder: "#000",
              text: "#000",
              primary: "#4942E4",
              underlineColor: "transparent",
              background: "#fff",
              outline: "lightgrey",
            },
          }}
        />

        <View style={{ flexDirection: "row", marginTop: 20, paddingRight: 20 }}>
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            color="#4942E4"
            onPress={() => setChecked(!checked)}
          />
          <Text>
            I have read and hereby accept the LaConnect
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => navigation.navigate("Policy")}
            >
              <Text style={{ color: "#1E319D" }}>
                Terms of Use & Privacy Policy.
              </Text>
            </TouchableOpacity>
          </Text>
          <Text></Text>
        </View>

        <View
          style={{
            marginVertical: 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TouchableHighlight
            style={styles.button}
            onPress={handleNext}
            underlayColor="#1E319D"
          >
            <Text style={styles.buttonText}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                "Next"
              )}
            </Text>
          </TouchableHighlight>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginVertical: 20,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "300" }}>Already have a account?</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Text
              style={{ marginLeft: 5, fontWeight: "700", color: "#1E319D" }}
            >
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
    borderTopEndRadius: 50,
    borderTopStartRadius: 50,
  },
  button: {
    width: "100%",
    backgroundColor: "#1E319D",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 20,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
