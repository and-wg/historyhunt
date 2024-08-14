import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Image, Alert } from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function HuntMapScreen({ route, navigation }) {
  const { huntId } = route.params;
  const [hasPermission, setHasPermission] = useState(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    try {
      if (hasPermission) {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
          setPhoto(result.assets[0].uri);
          await uploadImage(result.assets[0].uri);
        }
      } else {
        Alert.alert("Fel", "Kameratillstånd nekades");
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

    const filename = `hunt_${huntId}_${new Date().getTime()}.jpg`;
    const storageRef = ref(storage, `huntPhotos/${user.uid}/${filename}`);

    try {
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateFirestore(downloadURL);
      Alert.alert("Framgång", "Bild uppladdad och sparad!");
    } catch (error) {
      console.error("Fel vid uppladdning:", error);
      Alert.alert("Fel", "Kunde inte ladda upp bilden: " + error.message);
    }
  };

  const updateFirestore = async (imageUrl) => {
    const db = getFirestore();
    const huntRef = doc(db, "hunts", huntId);

    try {
      await updateDoc(huntRef, {
        photos: imageUrl,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Fel vid uppdatering av Firestore:", error);
      Alert.alert("Fel", "Kunde inte uppdatera databasen: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Karta för Jakt {huntId}</Text>
      <Text>Här kommer kartan att visas</Text>
      {photo && <Image source={{ uri: photo }} style={styles.photo} />}
      <Button title="Ta en bild" onPress={takePicture} />
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
    marginVertical: 20,
  },
});
