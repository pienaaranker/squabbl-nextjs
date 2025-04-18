import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Fetches the state of a feature flag from Firebase
 * @param featurePath - The path to the feature flag (e.g., "donations.active")
 * @returns Promise<boolean> - The state of the feature flag
 */
export async function getFeatureFlag(featurePath: string): Promise<boolean> {
  try {
    console.log("Fetching feature flag:", featurePath);
    const [documentId, field] = featurePath.split('.');
    
    const featureRef = doc(db, "features", documentId);
    const featureDoc = await getDoc(featureRef);
    
    if (!featureDoc.exists()) {
      console.log(`No feature document found for ${documentId}`);
      return false;
    }

    const data = featureDoc.data();
    console.log(`Feature document data for ${documentId}:`, data);

    if (!data || data[field] === undefined) {
      console.log(`Field ${field} not found in feature document`);
      return false;
    }

    const result = Boolean(data[field]);
    console.log("Final feature flag value:", result);
    return result;
  } catch (error) {
    console.error("Error fetching feature flag:", error);
    return false;
  }
} 