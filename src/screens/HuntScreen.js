import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function HuntMapScreen({ route, navigation }) {
  const { huntId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Karta för Jakt {huntId}</Text>
      <Text>Här kommer kartan att visas</Text>
      <Button title="Ta en bild" onPress={() => console.log("Öppna kamera")} />
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
});
