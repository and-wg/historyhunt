import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Title, Input, SignupButton } from "../components/SignupComponents";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Fel", "Vänligen fyll i alla fält");
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });

      Alert.alert("Framgång", "Konto skapat framgångsrikt!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Fel", error.message);
    }
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
