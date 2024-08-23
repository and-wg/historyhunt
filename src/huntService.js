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
  getDoc,
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

export const completedPlace = async (huntId, userid, imageUrl, place) => {
  try {
    const huntRef = doc(db, "hunts", huntId);
    const huntSnapshot = await getDoc(huntRef);

    if (!huntSnapshot.exists()) {
      throw new Error("Hunt not found");
    }

    const huntData = huntSnapshot.data();
    const participants = huntData.participants || [];
    const userParticipantIndex = participants.findIndex(
      (p) => p.userid === userid
    );

    if (userParticipantIndex === -1) {
      throw new Error("User not found in participants");
    }

    const userParticipant = participants[userParticipantIndex];
    if (!userParticipant.visitedPlaces) {
      userParticipant.visitedPlaces = [];
    }

    if (userParticipant.visitedPlaces.some((vp) => vp.placeId === place.id)) {
      throw new Error("This place has already been visited");
    }

    const newVisitedPlace = {
      placeId: place.id,
      imageUrl: imageUrl,
    };

    userParticipant.visitedPlaces.push(newVisitedPlace);

    const allPlacesVisited = huntData.places.every((p) =>
      userParticipant.visitedPlaces.some((vp) => vp.placeId === p.id)
    );

    if (allPlacesVisited) {
      userParticipant.status = "completed";
    }

    const updatedParticipants = participants.map((p) =>
      p.userid === userid ? userParticipant : p
    );

    await updateDoc(huntRef, {
      participants: updatedParticipants,
    });

    return userParticipant;
  } catch (e) {
    console.error("Error in completedPlace:", e);
    throw e;
  }
};

export const countCompletedHunts = async (userId) => {
  try {
    const huntsRef = collection(db, "hunts");

    const huntsQuery = query(huntsRef);

    const querySnapshot = await getDocs(huntsQuery);

    let completedCount = 0;

    querySnapshot.forEach((doc) => {
      const huntData = doc.data();

      if (Array.isArray(huntData.participants)) {
        const userParticipant = huntData.participants.find((participant) => {
          if (typeof participant === "string") {
            return participant === userId;
          } else if (typeof participant === "object") {
            return participant.userid === userId;
          }
          return false;
        });

        if (userParticipant) {
          if (
            typeof userParticipant === "object" &&
            userParticipant.status === "completed"
          ) {
            completedCount++;
          }
        }
      }
    });

    console.log("Totalt antal avslutade jakter:", completedCount);
    return completedCount;
  } catch (error) {
    console.error("Fel vid räkning av avslutade jakter:", error);
    throw error;
  }
};

export const confirmHunt = async (huntId, userid) => {
  try {
    const huntRef = doc(db, "hunts", huntId);
    const huntSnapshot = await getDoc(huntRef);

    const hunt = huntSnapshot.data();

    let updatedParticipants = hunt.participants;
    let userParticipant = updatedParticipants.find((p) => p.userid === userid);
    userParticipant.status = "confirmed";

    await updateDoc(huntRef, {
      participants: updatedParticipants,
    });
  } catch (e) {
    console.error("Error confirming hunt: ", e);
    throw e;
  }
};

export const getActiveHunts = async (currentUserId) => {
  try {
    const q = query(collection(db, "hunts"));
    const querySnapshot = await getDocs(q);
    let activeHunts = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((hunt) =>
        hunt.participants.some((p) => p.userid === currentUserId)
      );
    return activeHunts;
  } catch (e) {
    console.error("Error getting active hunts: ", e);
    throw e;
  }
};

export const getPlannedHunts = async (currentUserId) => {
  try {
    const q = query(collection(db, "hunts"));
    const querySnapshot = await getDocs(q);
    let plannedHunts = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((hunt) => hunt.userid === currentUserId);
    return plannedHunts;
  } catch (e) {
    console.error("Error getting planned hunts: ", e);
    throw e;
  }
};

export const getHunt = async (huntId) => {
  try {
    const huntRef = doc(db, "hunts", huntId);
    const huntSnapshot = await getDoc(huntRef);

    if (huntSnapshot.exists()) {
      return {
        id: huntSnapshot.id,
        ...huntSnapshot.data(),
      };
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting hunt: ", e);
    throw e;
  }
};
