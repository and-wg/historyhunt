import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { createPlaces } from "../huntService";

export default function SelectPlacesScreen({ route, navigation }) {
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState(null);
  const { huntId } = route.params;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const handleMapPress = (event) => {
    const newPlace = {
      name: `Place ${places.length + 1}`,
      coordinates: event.nativeEvent.coordinate,
    };
    setPlaces([...places, newPlace]);
  };

  const handleSavePlaces = async () => {
    try {
      await createPlaces(huntId, places);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error saving places:", error);
    }
  };

  if (!region) {
    return (
      <View style={styles.container}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Välj platser för jakten</Text>
      <MapView
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
      >
        {places.map((place, index) => (
          <Marker
            key={index}
            coordinate={place.coordinates}
            title={place.name}
          />
        ))}
      </MapView>
      <View style={styles.placesContainer}>
        {places.map((place, index) => (
          <Text key={index}>{place.name}</Text>
        ))}
      </View>
      <Button title="Spara platser" onPress={handleSavePlaces} />
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
  map: {
    width: Dimensions.get("window").width - 40,
    height: Dimensions.get("window").height / 2,
    marginBottom: 20,
  },
  placesContainer: {
    marginBottom: 20,
  },
});
