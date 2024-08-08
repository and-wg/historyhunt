import React from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";

export const Title = ({ children }) => (
  <Text style={styles.title}>{children}</Text>
);

export const Input = ({ placeholder, value, onChangeText, ...props }) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    {...props}
  />
);

export const SignupButton = ({ onPress }) => (
  <Button title="Registrera" onPress={onPress} />
);

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
