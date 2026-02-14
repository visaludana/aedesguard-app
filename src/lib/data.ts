import type { SurveillanceReport } from './types';
import { PlaceHolderImages } from './placeholder-images';

const breedingSite1Before = PlaceHolderImages.find(img => img.id === 'breeding-site-1-before');
const breedingSite2Before = PlaceHolderImages.find(img => img.id === 'breeding-site-2-before');
const userAvatar1 = PlaceHolderImages.find(img => img.id === 'user-avatar-1');
const userAvatar2 = PlaceHolderImages.find(img => img.id === 'user-avatar-2');


export const mockSurveillanceReports: SurveillanceReport[] = [
  {
    id: 'report-001',
    location: { lat: 6.9271, lng: 79.8612 },
    locationName: "Viharamahadevi Park, Colombo",
    larvaeGenus: 'Aedes aegypti',
    riskLevel: 9,
    isNeutralized: false,
    reportedAt: new Date('2024-07-20T10:00:00Z').toISOString(),
    habitatDescription: 'Stagnant water in a discarded tire in the backyard.',
    imageUrl: breedingSite1Before?.imageUrl ?? "https://picsum.photos/seed/tirewater/800/600",
    imageHint: breedingSite1Before?.imageHint ?? "tire water",
    reportedBy: 'Nimal Perera',
    userAvatarUrl: userAvatar1?.imageUrl,
    userAvatarHint: userAvatar1?.imageHint,
  },
  {
    id: 'report-002',
    location: { lat: 7.2906, lng: 80.6337 },
    locationName: "Kandy Lake, Kandy",
    larvaeGenus: 'Culex',
    riskLevel: 5,
    isNeutralized: true,
    reportedAt: new Date('2024-07-19T14:30:00Z').toISOString(),
    habitatDescription: 'Flower pot tray with excess water.',
    imageUrl: breedingSite2Before?.imageUrl ?? "https://picsum.photos/seed/potwater/800/600",
    imageHint: breedingSite2Before?.imageHint ?? "flower pot",
    neutralizedImageUrl: PlaceHolderImages.find(img => img.id === 'breeding-site-2-after')?.imageUrl,
    reportedBy: 'Sunita Silva',
    userAvatarUrl: userAvatar2?.imageUrl,
    userAvatarHint: userAvatar2?.imageHint,
  },
  {
    id: 'report-003',
    location: { lat: 6.0535, lng: 80.2210 },
    locationName: "Galle Fort",
    larvaeGenus: 'Aedes aegypti',
    riskLevel: 7,
    isNeutralized: false,
    reportedAt: new Date('2024-07-21T08:00:00Z').toISOString(),
    habitatDescription: 'Clogged roof gutter holding rainwater.',
    imageUrl: 'https://picsum.photos/seed/gutter/800/600',
    imageHint: 'gutter water',
    reportedBy: 'Kamal Fernando',
    userAvatarUrl: 'https://picsum.photos/seed/avatar3/100/100',
    userAvatarHint: 'man portrait',
  },
    {
    id: 'report-004',
    location: { lat: 9.6615, lng: 80.0255 },
    locationName: "Jaffna Library",
    larvaeGenus: 'Unknown',
    riskLevel: 3,
    isNeutralized: true,
    reportedAt: new Date('2024-07-18T11:00:00Z').toISOString(),
    habitatDescription: 'Old bucket collecting rainwater.',
    imageUrl: 'https://picsum.photos/seed/bucket/800/600',
    imageHint: 'bucket water',
    reportedBy: 'Rajini Somasundaram',
    userAvatarUrl: 'https://picsum.photos/seed/avatar4/100/100',
    userAvatarHint: 'woman portrait',
  },
];

// Simple async function to simulate fetching data
export const getReports = async (): Promise<SurveillanceReport[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockSurveillanceReports);
    }, 500);
  });
};

export const getReportById = async (id: string): Promise<SurveillanceReport | undefined> => {
    return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockSurveillanceReports.find(report => report.id === id));
    }, 300);
  });
}
