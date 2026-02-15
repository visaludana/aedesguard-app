'use server';

import { firestore } from '@/firebase/server';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import type { DistrictRisk } from './types';

// This is a server-side only file.
const districtRisksCol = collection(firestore, 'district_risks');

/**
 * Fetches all cached district risk assessments from Firestore.
 */
export async function getDistrictRisks(): Promise<DistrictRisk[]> {
  try {
    const snapshot = await getDocs(districtRisksCol);
    return snapshot.docs.map(doc => doc.data() as DistrictRisk);
  } catch (error) {
    console.error("Error fetching district risks from Firestore:", error);
    return [];
  }
}

/**
 * Fetches a single district's cached risk assessment.
 */
export async function getDistrictRisk(districtName: string): Promise<DistrictRisk | null> {
    try {
        const docRef = doc(firestore, 'district_risks', districtName);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return snapshot.data() as DistrictRisk;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching district risk for ${districtName}:`, error);
        return null;
    }
}


/**
 * Updates or creates a district's risk assessment in Firestore.
 * This is a fire-and-forget operation on the server.
 */
export async function updateDistrictRisk(districtName: string, data: Omit<DistrictRisk, 'name'>) {
  const docRef = doc(firestore, 'district_risks', districtName);
  const dataToSet: DistrictRisk = {
    name: districtName,
    ...data,
  };
  // Fire-and-forget write. We don't await the result on the server.
  // Errors will be logged on the server if they occur.
  setDoc(docRef, dataToSet, { merge: true }).catch(error => {
    console.error(`Failed to update district risk for ${districtName}:`, error);
  });
}
