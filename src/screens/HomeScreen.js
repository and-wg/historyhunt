import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { getActiveHunts, getPlannedHunts } from "../huntService";

export default function HomeScreen({ navigation }) {
  const [activeHunts, setActiveHunts] = useState([
    { id: "1", name: "Stadsvandring i Gamla Stan" },
    { id: "2", name: "Historiska Byggnader" },
  ]);
  const [plannedHunts, setPlannedHunts] = useState([
    { id: "3", name: "Skattjakt i Parken" },
    { id: "4", name: "Museirunda" },
  ]);

  useEffect(() => {
    const fetchHunts = async () => {
      try {
        const activeHuntsData = await getActiveHunts();
        const plannedHuntsData = await getPlannedHunts();
        setActiveHunts(activeHuntsData);
        setPlannedHunts(plannedHuntsData);
      } catch (error) {
        console.error("Error fetching hunts:", error);
      }
    };

    fetchHunts();
  }, []);

  const renderHuntItem = (item, isActive) => (
    <TouchableOpacity
      style={styles.huntItem}
      onPress={() => navigation.navigate("Hunt", { huntId: item.id, isActive })}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={require("../../assets/profile-image.png")}
          style={styles.profileImage}
        />
        <Text style={styles.username}>Användare</Text>
      </View>

      <Text style={styles.sectionTitle}>Aktiva Jakter:</Text>
      <FlatList
        data={activeHunts}
        renderItem={({ item }) => renderHuntItem(item, true)}
        keyExtractor={(item) => item.id}
      />

      <Text style={styles.sectionTitle}>Planerade Jakter:</Text>
      <FlatList
        data={plannedHunts}
        renderItem={({ item }) => renderHuntItem(item, false)}
        keyExtractor={(item) => item.id}
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
