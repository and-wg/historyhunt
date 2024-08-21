import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import CreateHuntScreen from "./screens/CreateHuntScreen";
import HuntScreen from "./screens/HuntScreen";
import InviteScreen from "./screens/InviteScreen";
import SelectPlacesScreen from "./screens/SelectPlacesScreen";
import ConfirmHuntScreen from "./screens/ConfirmHuntScreen";

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
        name="Signup"
        component={SignupScreen}
        options={{ title: "Registrera" }}
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
      <Stack.Screen
        name="Invite"
        component={InviteScreen}
        options={{ title: "Friends" }}
      />
      <Stack.Screen
        name="SelectPlaces"
        component={SelectPlacesScreen}
        options={{ title: "Places" }}
      />

      <Stack.Screen
        name="ConfirmHunt"
        component={ConfirmHuntScreen}
        options={{ title: "Confirm hunt" }}
      />
    </Stack.Navigator>
  );
}
