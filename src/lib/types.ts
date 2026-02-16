export type SurveillanceReport = {
  id: string;
  location: { lat: number; lng: number; };
  locationName: string;
  larvaeGenus: 'Aedes aegypti' | 'Culex' | 'Unknown';
  riskLevel: number; // 1-10
  isNeutralized: boolean;
  reportedAt: string; // ISO 8601 date string
  habitatDescription: string;
  imageUrl: string;
  imageHint: string;
  neutralizedImageUrl?: string;
  neutralizedImageHint?: string;
  reportedBy: string;
  userAvatarUrl?: string;
  userAvatarHint?: string;
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

    