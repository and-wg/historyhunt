import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

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
