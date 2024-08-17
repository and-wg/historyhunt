import { db } from "./firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import uuid from "react-native-uuid";

export const createHunt = async (huntData) => {
  try {
    const docRef = await addDoc(collection(db, "hunts"), huntData);
    console.log("Hunt created with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding hunt: ", e);
    throw e;
  }
};

export const createPlaces = async (huntId, places) => {
  try {
    const huntRef = doc(db, "hunts", huntId);

    const validatedPlaces = places.map((place) => ({
      id: uuid.v4(),
      name: place.name,
      coordinates: place.coordinates,
    }));

    await updateDoc(huntRef, {
      places: arrayUnion(...validatedPlaces),
    });

    console.log("Places added to hunt with ID: ", huntId);
    return huntId;
  } catch (e) {
    console.error("Error creating places: ", e);
    throw e;
  }
};

export const getActiveHunts = async () => {
  try {
    const q = query(collection(db, "hunts"), where("status", "==", "active"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting active hunts: ", e);
    throw e;
  }
};

export const getPlannedHunts = async () => {
  try {
    const q = query(collection(db, "hunts"), where("status", "==", "planned"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting planned hunts: ", e);
    throw e;
  }
};
