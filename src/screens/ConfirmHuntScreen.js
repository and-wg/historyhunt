import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { getHunt, confirmHunt } from "../huntService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ConfirmHuntScreen = ({ route, navigation }) => {
  const [hunt, setHunt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { huntId } = route.params;

  useEffect(() => {
    const fetchHunt = async () => {
      try {
        const huntData = await getHunt(huntId);
        if (huntData) {
          setHunt(huntData);
        } else {
          setError("Hunt not found");
        }
      } catch (err) {
        setError("Error fetching hunt data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHunt();
  }, [huntId]);

  const handleConfirmHunt = async () => {
    try {
      const currentUserId = await AsyncStorage.getItem("userid");
      await confirmHunt(huntId, currentUserId);
      console.log("navigating to hunt");
      navigation.navigate("Hunt", { huntId: huntId });
    } catch (error) {
      console.error("Error confirming hunt:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const calculateRegion = () => {
    if (hunt.places.length === 0) return null;

    let minLat = hunt.places[0].coordinates.latitude;
    let maxLat = hunt.places[0].coordinates.latitude;
    let minLong = hunt.places[0].coordinates.longitude;
    let maxLong = hunt.places[0].coordinates.longitude;

    hunt.places.forEach((place) => {
      minLat = Math.min(minLat, place.coordinates.latitude);
      maxLat = Math.max(maxLat, place.coordinates.latitude);
      minLong = Math.min(minLong, place.coordinates.longitude);
      maxLong = Math.max(maxLong, place.coordinates.longitude);
    });

    const latDelta = (maxLat - minLat) * 1.2;
    const longDelta = (maxLong - minLong) * 1.2;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLong + maxLong) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(longDelta, 0.01),
    };
  };

  const initialRegion = calculateRegion();

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>You picked:</Text>
        <Text style={styles.huntName}>{hunt.name}</Text>
        <Text style={styles.subtitle}>
          Here is the route you will be taking:
        </Text>
        {initialRegion && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={initialRegion}
              pitchEnabled={false}
              rotateEnabled={false}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              {hunt.places.map((place, index) => (
                <Marker
                  key={index}
                  coordinate={place.coordinates}
                  title={place.name}
                >
                  <View style={styles.markerContainer}>
                    <Text style={styles.markerText}>{index + 1}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>
        )}
        <View style={styles.legendContainer}>
          {hunt.places.length > 0 && (
            <>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendMarker, { backgroundColor: "#007AFF" }]}
                />
                <Text style={styles.legendText}>
                  {hunt.places[0].name} (Start)
                </Text>
              </View>
              {hunt.places.length > 1 && (
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendMarker,
                      { backgroundColor: "#8A2BE2" },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {hunt.places[hunt.places.length - 1].name} (End)
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        <Text style={styles.subtitle}>This should take approximately:</Text>
        <Text style={styles.duration}>{hunt.estimatedTime} minutes</Text>
      </View>

      <Button title="Confirm" onPress={handleConfirmHunt} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    overflow: "scroll",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#888888",
    marginBottom: 5,
  },
  huntName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  huntImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  legendContainer: {
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
  },
  duration: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  participants: {
    fontSize: 16,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  markerContainer: {
    backgroundColor: "#FFA500",
    borderRadius: 15,
    padding: 5,
  },
  markerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default ConfirmHuntScreen;
