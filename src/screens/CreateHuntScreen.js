import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { createHunt } from "../huntService";

export default function CreateHuntScreen({ navigation }) {
  const [huntName, setHuntName] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  const handleCreateHunt = async () => {
    try {
      const huntData = {
        name: huntName,
        estimatedTime: parseInt(estimatedTime),
        status: "planned",
        createdAt: new Date(),
      };
      await createHunt(huntData);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error creating hunt:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skapa ny Jakt</Text>
      <TextInput
        style={styles.input}
        placeholder="Jaktens namn"
        value={huntName}
        onChangeText={setHuntName}
      />
      <TextInput
        style={styles.input}
        placeholder="Uppskattad tid (minuter)"
        value={estimatedTime}
        onChangeText={setEstimatedTime}
        keyboardType="numeric"
      />
      <Button title="Skapa Jakt" onPress={handleCreateHunt} />
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
});
