'use server';

import { initializeFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { DistrictRisk } from './types';

// This is a server-side only file.
const { firestore } = initializeFirebase();

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
 * Uses a non-blocking write.
 */
export function updateDistrictRisk(districtName: string, data: Omit<DistrictRisk, 'name'>) {
  const docRef = doc(firestore, 'district_risks', districtName);
  const dataToSet: DistrictRisk = {
    name: districtName,
    ...data,
  };
  // Use non-blocking write as we don't need to wait for the result on the server.
  // The client will eventually get the updated data on the next load.
  setDocumentNonBlocking(docRef, dataToSet, { merge: true });
}

    