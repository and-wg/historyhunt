import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import CreateHuntScreen from "./screens/CreateHuntScreen";
import HuntScreen from "./screens/HuntScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Hem" }}
      />
      <Stack.Screen
        name="CreateHunt"
        component={CreateHuntScreen}
        options={{ title: "Skapa Jakt" }}
      />
      <Stack.Screen
        name="Hunt"
        component={HuntScreen}
        options={{ title: "Jakt" }}
      />
    </Stack.Navigator>
  );
}
