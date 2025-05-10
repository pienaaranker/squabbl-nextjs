import * as functions from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp, DocumentReference, QueryDocumentSnapshot } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
initializeApp();

const SUBCOLLECTIONS = ["players", "teams", "words"];

// Get Firestore instance
const db = getFirestore();

/**
 * Recursively deletes all subcollections for a given document reference.
 */
async function deleteSubcollections(docRef) {
  for (const sub of SUBCOLLECTIONS) {
    const subColSnap = await docRef.collection(sub).get();
    const batch = db.batch();
    subColSnap.docs.forEach((doc) => batch.delete(doc.ref));
    if (!subColSnap.empty) {
      await batch.commit();
    }
  }
}

/**
 * Scheduled function to delete expired games and their subcollections.
 */
export const deleteExpiredGames = onSchedule("every 24 hours", async (event) => {
  const now = Timestamp.now();
  const expiredThreshold = Timestamp.fromDate(new Date(now.toDate().getTime() - 24 * 60 * 60 * 1000)); // 24 hours ago
  const expiredGamesSnap = await db.collection("games")
    .where("createdAt", "<=", expiredThreshold)
    .get();

  if (expiredGamesSnap.empty) {
    console.log("No expired games to delete.");
  }

  for (const doc of expiredGamesSnap.docs) {
    await deleteSubcollections(doc.ref);
    await doc.ref.delete();
    console.log(`Deleted game ${doc.id} and its subcollections.`);
  }
});