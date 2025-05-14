import { useUserStore } from "@/storage/userDataStore";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const url = Constants.expoConfig.extra.API_URL;

export default function LoginScreen() {
  const [username, setUsername] = useState("1");
  const setUser = useUserStore((state) => state.setUser);
  const [password, setPassword] = useState("1");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user === "loggedIn") {
        router.replace("/dashboard");
      }
    };
    checkLogin();
  }, []);

  const fetchUserData = async (username) => {
    
    const response = await axios.get(`${url}/api/users/getUserData/${username}`);
    setUser(response.data); 
    setUser({username:response.data.email});// Save the user data in Zustand store
    //console.log("User data:", user); // Log the response data
    
  };

  const handleLogin = async () => {
    const response = await axios.post(`${url}/api/users/authUser`,{username, password});
    //console.log(response.data); // Log the response data);
    
    if (response.data === 1) { 
      try {
        fetchUserData(username); 
        //await AsyncStorage.setItem("user", u); // Save the login state in AsyncStorage
        await AsyncStorage.setItem("password", password); //WARNING: this is not secure, use JWT
        router.replace("/dashboard");
        //console.log("User data:", user?.username); 
      } catch (error) {
        Alert.alert("Error", "Failed to save login state."); 
      }
    } else {
      Alert.alert("Invalid Credentials", "Please enter valid ID and Password"); //if incorrect, show an alert
    }
  };
  
  return (
    <View style={styles.container}>
      <Image
  source={require("../assets/images/pradan_logo.png")} 
  style={styles.logo}
  resizeMode="contain"
/>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>
          <Text>Login to </Text>
          <Text style={{ fontWeight: "bold" }}>Pradan</Text>
        </Text>
      </View>
      <View style={{ margin: 18 }}></View>

      {/* Username Input */}
      <View style={styles.inputContainer}>
      <FontAwesome name="envelope" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="abc123@gmail.com"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
      <FontAwesome name="lock" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.showButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.showButtonText}>{showPassword ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: "auto",
    maxWidth: 480,
    width: "100%",
    paddingHorizontal: 39,
    paddingVertical: 150,
    alignItems: "stretch",
    backgroundColor: "#f9f9f9",
  },
  logo: {
    width: 200,
    height: 70,
    alignSelf: "center",
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: "center",
  },
  titleText: {
    fontFamily: "Roboto",
    fontSize: 32,
    color: "#000",
    lineHeight: 38,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 19,
    borderColor: "#038003",
    borderWidth: 1,
    minWidth: 240,
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 10,
    color:'#4a7744',
  },
  input: {
    flex: 1,
    fontFamily: "Roboto",
    fontSize: 16,
    color: "#000",
    fontWeight: "100",
    letterSpacing: 0.2,
  },
  showButton: {
    marginLeft: 10,
  },
  showButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#038003",
  },
  button: {
    alignSelf: "center",
    borderRadius: 8,
    backgroundColor: "#134e13",
    minHeight: 50,
    width: 150,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
});