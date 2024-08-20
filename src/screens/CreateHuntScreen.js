import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { createHunt } from "../huntService";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CreateHuntScreen({ navigation }) {
  const [huntName, setHuntName] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [huntImage, setHuntImage] = useState(null);

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "We need camera permission to take pictures."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setHuntImage(result.assets[0].uri);
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
    const filename = `hunt_${new Date().getTime()}.jpg`;
    const storageRef = ref(storage, `huntImages/${filename}`);

    try {
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleCreateHunt = async () => {
    try {
      let imageUrl = null;
      if (huntImage) {
        imageUrl = await uploadImage(huntImage);
      }

      const huntData = {
        name: huntName,
        estimatedTime: parseInt(estimatedTime),
        status: "planned",
        createdAt: new Date(),
        imageUrl: imageUrl,
      };

      const createdHuntId = await createHunt(huntData);
      navigation.navigate("Invite", { huntId: createdHuntId });
    } catch (error) {
      console.error("Error creating hunt:", error);
      Alert.alert("Error", "Could not create hunt: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Hunt</Text>
      <TextInput
        style={styles.input}
        placeholder="Hunt Name"
        value={huntName}
        onChangeText={setHuntName}
      />
      <TextInput
        style={styles.input}
        placeholder="Estimated Time (minutes)"
        value={estimatedTime}
        onChangeText={setEstimatedTime}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.imagePicker} onPress={takePicture}>
        {huntImage ? (
          <Image source={{ uri: huntImage }} style={styles.image} />
        ) : (
          <Text>Take a picture for the hunt</Text>
        )}
      </TouchableOpacity>
      <Button title="Continue" onPress={handleCreateHunt} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
