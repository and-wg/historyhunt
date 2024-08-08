import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Title, Input, SignupButton } from "../components/SignupComponents";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    console.log("Försöker registrera med:", name, email, password);
  };

  return (
    <View style={styles.container}>
      <Title>Registrera dig</Title>
      <Input placeholder="Namn" value={name} onChangeText={setName} />
      <Input
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        placeholder="Lösenord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <SignupButton onPress={handleSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
});
