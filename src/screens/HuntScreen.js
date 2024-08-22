import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  Alert,
  FlatList,
  Dimensions,
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
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

export default function HuntMapScreen({ route, navigation }) {
  const { huntId } = route.params;
  const [hasPermission, setHasPermission] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [region, setRegion] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();
      setHasPermission(
        cameraStatus === "granted" && locationStatus === "granted"
      );

      if (locationStatus === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        const currentPos = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentPosition(currentPos);
        setRegion({
          ...currentPos,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }

      await fetchHuntData();
    })();
  }, []);

  const fetchHuntData = async () => {
    const db = getFirestore();
    const huntRef = doc(db, "hunts", huntId);

    try {
      const huntDoc = await getDoc(huntRef);
      if (huntDoc.exists()) {
        const huntData = huntDoc.data();
        setPhotos(huntData.photos || []);

        const places = huntData.places || [];
        const formattedPlaces = places.map((place) => ({
          name: place.name,
          coordinates: {
            latitude: place.coordinates.latitude,
            longitude: place.coordinates.longitude,
          },
        }));
        setSelectedPlaces(formattedPlaces);

        console.log("Fetched places:", formattedPlaces);

        if (formattedPlaces.length > 0 && currentPosition) {
          const newRegion = calculateRegion([
            ...formattedPlaces,
            { coordinates: currentPosition },
          ]);
          if (newRegion) {
            setRegion(newRegion);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching hunt data:", error);
      Alert.alert("Fel", "Kunde inte hämta jaktdata: " + error.message);
    }
  };

  const calculateRegion = (places) => {
    if (places.length === 0) {
      return null;
    }

    let minLat = places[0].coordinates.latitude;
    let maxLat = places[0].coordinates.latitude;
    let minLon = places[0].coordinates.longitude;
    let maxLon = places[0].coordinates.longitude;

    places.forEach((place) => {
      minLat = Math.min(minLat, place.coordinates.latitude);
      maxLat = Math.max(maxLat, place.coordinates.latitude);
      minLon = Math.min(minLon, place.coordinates.longitude);
      maxLon = Math.max(maxLon, place.coordinates.longitude);
    });

    const midLat = (minLat + maxLat) / 2;
    const midLon = (minLon + maxLon) / 2;

    const deltaLat = (maxLat - minLat) * 1.1; // 10% padding
    const deltaLon = (maxLon - minLon) * 1.1; // 10% padding

    // Ensure minimum delta to avoid excessive zoom
    const minDelta = 0.01;
    const latitudeDelta = Math.max(deltaLat, minDelta);
    const longitudeDelta = Math.max(deltaLon, minDelta);

    // Adjust longitude delta based on the aspect ratio of the device screen
    const { width, height } = Dimensions.get("window");
    const aspectRatio = width / height;
    const adjustedLongitudeDelta = latitudeDelta * aspectRatio;

    return {
      latitude: midLat,
      longitude: midLon,
      latitudeDelta: latitudeDelta,
      longitudeDelta: Math.max(longitudeDelta, adjustedLongitudeDelta),
    };
  };

  const takePicture = async (place) => {
    if (hasPermission) {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUrl = await uploadImage(result.assets[0].uri);
        if (imageUrl) {
          await updateFirestore(imageUrl, place);
          setPhotos([...photos, { url: imageUrl, place: place.name }]);
        }
      }
    } else {
      Alert.alert(
        "Behörighet saknas",
        "Kamera- och platsbehörighet krävs för att ta bilder."
      );
    }
  };

  const uploadImage = async (uri) => {
    const storage = getStorage();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Fel", "Ingen användare inloggad");
      return null;
    }

    const filename = uri.substring(uri.lastIndexOf("/") + 1);
    const storageRef = ref(
      storage,
      `hunt_photos/${user.uid}/${huntId}/${filename}`
    );

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image: ", error);
      Alert.alert("Fel", "Kunde inte ladda upp bilden: " + error.message);
      return null;
    }
  };

  const updateFirestore = async (imageUrl, place) => {
    const db = getFirestore();
    const huntRef = doc(db, "hunts", huntId);

    try {
      await updateDoc(huntRef, {
        photos: arrayUnion({ url: imageUrl, place: place.name }),
      });
    } catch (error) {
      console.error("Error updating Firestore: ", error);
      Alert.alert("Fel", "Kunde inte uppdatera jaktdata: " + error.message);
    }
  };

  if (!region || !currentPosition) {
    return (
      <View style={styles.container}>
        <Text>Laddar karta...</Text>
      </View>
    );
  }

  const routeCoordinates = [
    currentPosition,
    ...selectedPlaces.map((place) => place.coordinates),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Karta för Jakt {huntId}</Text>
      <MapView style={styles.map} region={region} initialRegion={region}>
        <Marker
          coordinate={currentPosition}
          title="Din position"
          pinColor="blue"
        />
        {selectedPlaces.map((place, index) => (
          <Marker
            key={index}
            coordinate={place.coordinates}
            title={place.name}
            pinColor="red"
            onPress={() => takePicture(place)}
          />
        ))}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#000"
          strokeWidth={2}
        />
      </MapView>
      <Text style={styles.subtitle}>
        Valda platser: {selectedPlaces.length}
      </Text>
      <FlatList
        data={photos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Image source={{ uri: item.url }} style={styles.photo} />
            <Text>{item.place}</Text>
          </View>
        )}
      />
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  map: {
    width: Dimensions.get("window").width - 40,
    height: Dimensions.get("window").height / 3,
    marginBottom: 10,
  },
  photo: {
    width: 300,
    height: 300,
    marginVertical: 10,
  },
});
