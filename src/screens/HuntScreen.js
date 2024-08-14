import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  Alert,
  FlatList,
} from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function HuntMapScreen({ route, navigation }) {
  const { huntId } = route.params;
  const [hasPermission, setHasPermission] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();

    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const db = getFirestore();
    const huntRef = doc(db, "hunts", huntId);

    try {
      const huntDoc = await getDoc(huntRef);
      if (huntDoc.exists()) {
        const huntData = huntDoc.data();
        setPhotos(huntData.photos || []);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      Alert.alert("Error", "Could not fetch photos: " + error.message);
    }
  };

  const takePicture = async () => {
    try {
      if (hasPermission) {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
          await uploadImage(result.assets[0].uri);
        }
      } else {
        Alert.alert("Error", "Camera permission denied");
      }
    } catch (error) {
      console.error("Could not take picture!", error);
      Alert.alert("Error", "Could not take picture: " + error.message);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No user logged in");
      return;
    }

    const filename = `hunt_${huntId}_${new Date().getTime()}.jpg`;
    const storageRef = ref(storage, `huntPhotos/${user.uid}/${filename}`);

    try {
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateFirestore(downloadURL);
      setPhotos((prevPhotos) => [...prevPhotos, downloadURL]);
      Alert.alert("Success", "Image uploaded and saved!");
    } catch (error) {
      console.error("Error uploading:", error);
      Alert.alert("Error", "Could not upload the image: " + error.message);
    }
  };

  const updateFirestore = async (imageUrl) => {
    const db = getFirestore();
    const huntRef = doc(db, "hunts", huntId);

    try {
      await updateDoc(huntRef, {
        photos: arrayUnion(imageUrl),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating Firestore:", error);
      Alert.alert("Error", "Could not update the database: " + error.message);
    }
  };

  const navigateToInviteScreen = () => {
    navigation.navigate("Invite", { huntId: huntId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map for Hunt {huntId}</Text>
      <Text>The map will be displayed here</Text>
      <FlatList
        data={photos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.photo} />
        )}
      />
      <Button title="Take a picture" onPress={takePicture} />
      <Button title="Invite Friends" onPress={navigateToInviteScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  photo: {
    width: 300,
    height: 300,
    marginVertical: 10,
  },
});
