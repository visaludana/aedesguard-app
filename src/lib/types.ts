

export type SurveillanceSample = {
  id: string; // Firestore document ID
  timestamp: string; // ISO 8601 date string
  latitude: number;
  longitude: number;
  locationName: string;
  habitatDescription: string;
  originalImageUrl: string; // URL or data URI
  
  // AI Classification fields
  speciesType: 'Aedes aegypti' | 'Culex' | 'No Larvae Detected' | 'Unknown';
  confidenceScore: number;
  riskLevel: number; // 1-10
  
  // AI Report fields
  reportEnglish?: string;
  reportSinhala?: string;
  reportTamil?: string;
  
  // Status
  isNeutralized: boolean;
  
  // Uploader info
  uploaderId: string;
  uploaderName: string;
  uploaderAvatarUrl?: string;

  // AI Submission Verification fields
  isVerifiedByAI?: boolean;
  aiSubmissionReasoning?: string;
  submissionAppealStatus?: 'pending' | 'approved' | 'rejected' | 'none';
};


export type District = {
  name: string;
  lat: number;
  lng: number;
};

export type DistrictRisk = {
  name: string;
  riskLevel: number;
  assessment: string;
  updatedAt: string; // ISO 8601 date string
  temperature: number;
  humidity: number;
  rainfall: number;
};

export type DistrictHealthReport = {
  id?: string; // id is optional on creation
  districtName: string;
  reportedDate: string; // ISO Date (YYYY-MM-DD)
  cases: number;
  deaths: number;
  reportedById: string;
  reportedAt: string; // ISO DateTime
};

export type UserProfile = {
  id: string;
  points: number;
  displayName: string;
  email: string;
  lastActivityAt: string;
  photoURL?: string;
  idNumber?: string;
  mobileNumber?: string;
};

export type NeutralizationVerification = {
  id?: string; // Optional because Firestore generates it.
  surveillanceSampleId: string;
  originalImageUrl: string;
  verificationImageUrl: string; // URL or Data URI
  verificationTimestamp: string;
  isVerifiedByAI: boolean;
  aiReason: string;
  verifierId: string;
  verifierName: string;
  pointsAwarded: number;
  appealStatus: 'pending' | 'approved' | 'rejected' | 'none';
};
