import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function InviteScreen({ navigation }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const auth = getAuth();
      const db = getFirestore();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("Ingen inloggad användare");
        setLoading(false);
        return;
      }

      const usersRef = collection(db, "users");
      console.log("userref", usersRef);
      const q = query(
        usersRef
        //where(firebase.firestore.FieldPath.documentId(), "==", currentUser.uid)
      );
      console.log("q", q);

      const querySnapshot = await getDocs(q);
      console.log("querysnapshot", querySnapshot);

      const friendsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("friendslist", friendsList);

      setFriends(friendsList);
      setLoading(false);
    } catch (error) {
      console.error("Fel vid hämtning av vänner:", error);
      setLoading(false);
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity style={styles.friendItem}>
      <Text style={styles.friendName}>{item.name}</Text>
      <Text style={styles.friendEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Laddar vänner...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dina vänner</Text>
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text style={styles.noFriendsText}>Du har inga vänner än.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  friendItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  friendEmail: {
    fontSize: 14,
    color: "#666",
  },
  noFriendsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
