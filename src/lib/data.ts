import type { SurveillanceReport } from './types';
import { PlaceHolderImages } from './placeholder-images';

const breedingSite1Before = PlaceHolderImages.find(img => img.id === 'breeding-site-1-before');
const breedingSite2Before = PlaceHolderImages.find(img => img.id === 'breeding-site-2-before');

export const mockSurveillanceReports: SurveillanceReport[] = [
  {
    id: 'report-001',
    locationName: "Colombo",
    larvaeGenus: 'Aedes aegypti',
    riskLevel: 9,
    isNeutralized: false,
    reportedAt: new Date('2024-07-20T10:00:00Z').toISOString(),
    habitatDescription: 'Stagnant water in a discarded tire in the backyard.',
    imageUrl: breedingSite1Before?.imageUrl ?? "https://picsum.photos/seed/tirewater/800/600",
    imageHint: breedingSite1Before?.imageHint ?? "tire water",
  },
  {
    id: 'report-002',
    locationName: "Kandy",
    larvaeGenus: 'Culex',
    riskLevel: 5,
    isNeutralized: true,
    reportedAt: new Date('2024-07-19T14:30:00Z').toISOString(),
    habitatDescription: 'Flower pot tray with excess water.',
    imageUrl: breedingSite2Before?.imageUrl ?? "https://picsum.photos/seed/potwater/800/600",
    imageHint: breedingSite2Before?.imageHint ?? "flower pot",
    neutralizedImageUrl: PlaceHolderImages.find(img => img.id === 'breeding-site-2-after')?.imageUrl,
  },
  {
    id: 'report-003',
    locationName: "Galle",
    larvaeGenus: 'Aedes aegypti',
    riskLevel: 7,
    isNeutralized: false,
    reportedAt: new Date('2024-07-21T08:00:00Z').toISOString(),
    habitatDescription: 'Clogged roof gutter holding rainwater.',
    imageUrl: 'https://picsum.photos/seed/gutter/800/600',
    imageHint: 'gutter water',
  },
    {
    id: 'report-004',
    locationName: "Jaffna",
    larvaeGenus: 'Unknown',
    riskLevel: 3,
    isNeutralized: true,
    reportedAt: new Date('2024-07-18T11:00:00Z').toISOString(),
    habitatDescription: 'Old bucket collecting rainwater.',
    imageUrl: 'https://picsum.photos/seed/bucket/800/600',
    imageHint: 'bucket water',
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
