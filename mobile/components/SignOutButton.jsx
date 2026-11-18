import { useClerk } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { Alert, Platform, Text, TouchableOpacity } from "react-native";
import { styles } from "../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to logout?")) {
        await signOut();
      }
      return;
    }

    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.logoutButton, Platform.OS === "web" && { cursor: "pointer" }]}
      onPress={handleSignOut}
    >
      <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
    </TouchableOpacity>
  );
};