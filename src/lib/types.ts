export type SurveillanceReport = {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
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
};
