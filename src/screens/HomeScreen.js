import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getActiveHunts, getPlannedHunts } from "../huntService";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";

export default function HomeScreen({ navigation }) {
  const [activeHunts, setActiveHunts] = useState([]);
  const [plannedHunts, setPlannedHunts] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("Användare");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchHunts(),
          requestCameraPermission(),
          loadUserData(),
        ]);
        const userid = AsyncStorage.getItem("userid");
      } catch (error) {
        console.error("Error fetching initial data:", error);
        Alert.alert("Fel", "Kunde inte ladda data. Vänligen försök igen.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchHunts = async () => {
    try {
      const [activeHuntsData, plannedHuntsData] = await Promise.all([
        getActiveHunts(),
        getPlannedHunts(),
      ]);
      setActiveHunts(activeHuntsData);
      setPlannedHunts(plannedHuntsData);
    } catch (error) {
      console.error("Error fetching hunts:", error);
      throw error;
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Behörighet nekad",
        "Vi behöver kameraåtkomst för att ta bilder."
      );
    }
  };

  const loadUserData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("No user logged in");
      return;
    }

    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
    console.log("userref", userRef);
    try {
      const docSnap = await getDoc(userRef);
      console.log("docsnap", docSnap);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("userData", userData);

        if (userData.profilePhoto) {
          setProfilePhoto(userData.profilePhoto);
        }
        if (userData.name) {
          setUsername(userData.name);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      throw error;
    }
  };

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Kunde inte ta bild!", error);
      Alert.alert("Fel", "Kunde inte ta bild: " + error.message);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Fel", "Ingen användare inloggad");
      return;
    }

    const filename = `profile_${user.uid}_${new Date().getTime()}.jpg`;
    const storageRef = ref(storage, `profilePhotos/${user.uid}/${filename}`);

    try {
      setLoading(true);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateFirestore(downloadURL);
      setProfilePhoto(downloadURL);
      Alert.alert("Framgång", "Profilbild uppladdad och sparad!");
    } catch (error) {
      console.error("Fel vid uppladdning:", error);
      Alert.alert("Fel", "Kunde inte ladda upp bilden: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFirestore = async (imageUrl) => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Fel", "Ingen användare inloggad");
      return;
    }

    const userRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userRef, {
        profilePhoto: imageUrl,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Fel vid uppdatering av Firestore:", error);
      throw error;
    }
  };

  const renderHuntItem = ({ item, isActive }) => (
    <TouchableOpacity
      style={styles.huntItem}
      onPress={() => navigation.navigate("Hunt", { huntId: item.id, isActive })}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={takePicture}>
          <Image
            source={
              profilePhoto
                ? { uri: profilePhoto }
                : require("../../assets/profile-image.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.username}>{username}</Text>
      </View>

      <Text style={styles.sectionTitle}>Aktiva Jakter:</Text>
      <FlatList
        data={activeHunts}
        renderItem={({ item }) => renderHuntItem({ item, isActive: true })}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Inga aktiva jakter</Text>}
      />

      <Text style={styles.sectionTitle}>Planerade Jakter:</Text>
      <FlatList
        data={plannedHunts}
        renderItem={({ item }) => renderHuntItem({ item, isActive: false })}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Inga planerade jakter</Text>}
      />

      <TouchableOpacity
        style={styles.createHuntButton}
        onPress={() => navigation.navigate("CreateHunt")}
      >
        <Text style={styles.createHuntText}>Skapa ny jakt</Text>
      </TouchableOpacity>

      <Text style={styles.medalsTitle}>MEDALJER</Text>
      <View style={styles.medalsContainer}>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.medal} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  huntItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  createHuntButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  createHuntText: {
    color: "white",
    fontSize: 16,
  },
  medalsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  medalsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  medal: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "gold",
    margin: 5,
  },
});
