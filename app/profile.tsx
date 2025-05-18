import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUserStore } from "../storage/userDatastore";

const url = Constants.expoConfig.extra.API_URL;

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  //const navigation = useNavigation();
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    const storedPassword = await AsyncStorage.getItem("password");
  
    if (oldPassword !== storedPassword) {
      Alert.alert("Error", "Old password is incorrect.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords and Confirm Password do not match.");
      return;
    }
      //console.log("Username",await AsyncStorage.getItem("username"));
      const username = user?.username;
      //console.log("axios started");
      const response = await axios.put(`${url}/api/users/changePassword`, {
      username,
     oldPassword,
      newPassword,
    });
    //console.log("Password change:",response.data); // Log the response data

    if(response.data === 1){
     //await AsyncStorage.setItem("password", newPassword);
     Alert.alert("Success", "Password changed successfully.");
    }

    setShowPasswordFields(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    logout; // Clear user data from Zustand store
    router.replace("/");
  };


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => {
    router.push('/dashboard'); // or whatever fallback screen you prefer
}}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <Image
          source={require("../assets/images/PROFILE.jpg")}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.designation}>{user?.role}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.username}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Mobile</Text>
          <Text style={styles.value}>{user?.mobile}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Date of Joining</Text>
          <Text style={styles.value}>{user?.date_of_joining}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{user?.location}</Text>
        </View>

        {/* <View style={styles.detailRow}>
          <Text style={styles.label}>Password</Text>
          <Text style={styles.value}>********</Text>
        </View> */}

        {/* Change Password */}
        <TouchableOpacity onPress={() => setShowPasswordFields(!showPasswordFields)}>
          <Text style={styles.changePassword}>Change Password</Text>
        </TouchableOpacity>

        {showPasswordFields && (
          <>
            <View style={styles.passwordInput}>
            <TextInput
            placeholder="Old Password"
            secureTextEntry={!showOldPass}
            style={styles.input}
            value={oldPassword}
            onChangeText={setOldPassword}
/>
              <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)}>
                <Ionicons name={showOldPass ? "eye-off" : "eye"} size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInput}>
            <TextInput
                placeholder="New Password"
                secureTextEntry={!showNewPass}
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
/>
              <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                <Ionicons name={showNewPass ? "eye-off" : "eye"} size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInput}>
            <TextInput
                  placeholder="Confirm New Password"
                  secureTextEntry={!showConfirmPass}
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                <Ionicons name={showConfirmPass ? "eye-off" : "eye"} size={22} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword}>
            <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

          </>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    marginLeft: 12,
  },
  card: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 4,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  designation: {
    fontSize: 14,
    color: "gray",
    marginBottom: 12,
  },
  detailRow: {
    width: "100%",
    marginVertical: 6,
  },
  label: {
    color: "gray",
    fontSize: 13,
  },
  value: {
    fontSize: 15,
    marginTop: 2,
  },
  changePassword: {
    color: "#2e7d32",
    fontWeight: "bold",
    marginTop: 16,
    alignSelf: "flex-start",
  },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginTop: 10,
    width: "100%",
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  submitButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
});