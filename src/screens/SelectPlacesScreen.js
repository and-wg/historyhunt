import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { createPlaces } from "../huntService";

export default function SelectPlacesScreen({ route, navigation }) {
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(null);
  const [placeName, setPlaceName] = useState("");
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
    setCurrentPlace({
      coordinates: event.nativeEvent.coordinate,
    });
    setModalVisible(true);
  };

  const handleSavePlace = () => {
    if (placeName.trim() !== "") {
      const newPlace = {
        name: placeName,
        coordinates: currentPlace.coordinates,
      };
      setPlaces([...places, newPlace]);
      setModalVisible(false);
      setPlaceName("");
      setCurrentPlace(null);
    }
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
        <Text>Laddar karta...</Text>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Namnge platsen:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setPlaceName}
              value={placeName}
              placeholder="Ange platsens namn"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={handleSavePlace}
              >
                <Text style={styles.textStyle}>Spara</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#FF0000",
  },
  buttonSave: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
