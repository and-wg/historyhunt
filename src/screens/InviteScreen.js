import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function InviteScreen({ route, navigation }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const { huntId } = route.params;

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
      const q = query(usersRef);

      const querySnapshot = await getDocs(q);

      const friendsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFriends(friendsList);
      setLoading(false);
    } catch (error) {
      console.error("Fel vid hämtning av vänner:", error);
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prevSelected) => {
      if (prevSelected.includes(friendId)) {
        return prevSelected.filter((id) => id !== friendId);
      } else {
        return [...prevSelected, friendId];
      }
    });
  };

  const inviteFriends = async () => {
    try {
      const db = getFirestore();
      const huntRef = doc(db, "hunts", huntId);

      await updateDoc(huntRef, {
        invitedFriends: arrayUnion(...selectedFriends),
      });

      console.log("Friends invited successfully");
      navigation.navigate("SelectPlaces", { huntId });
    } catch (error) {
      console.error("Error inviting friends:", error);
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        selectedFriends.includes(item.id) && styles.selectedFriend,
      ]}
      onPress={() => toggleFriendSelection(item.id)}
    >
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
      <Text style={styles.title}>Bjud in vänner</Text>
      {friends.length > 0 ? (
        <>
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
          />
          <Button
            title="Bjud in valda vänner och gå vidare"
            onPress={inviteFriends}
            disabled={selectedFriends.length === 0}
          />
        </>
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
  selectedFriend: {
    backgroundColor: "#e6f7ff",
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
