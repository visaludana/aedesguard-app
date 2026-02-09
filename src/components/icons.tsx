import type { SVGProps } from 'react';

export const AedesGuardLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a2.5 2.5 0 0 1 2.5 2.5c0 .72-.28 1.4-.78 1.9L9 11h6" />
    <path d="M12.5 21.5a2.5 2.5 0 0 1-5 0" />
    <path d="M10 16h4" />
    <path d="m15 11-4 5" />
    <path d="M9 11 5 5" />
    <path d="m19 5-4 6" />
  </svg>
);

export const MapMarkerIcon = (props: SVGProps<SVGSVGElement>) => (
   <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
   </svg>
);

export const MosquitoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a2.5 2.5 0 0 1 2.5 2.5c0 .72-.28 1.4-.78 1.9L9 11h6"/>
    <path d="M12.5 21.5a2.5 2.5 0 0 1-5 0"/>
    <path d="M10 16h4"/><path d="m15 11-4 5"/><path d="M9 11 5 5"/><path d="m19 5-4 6"/>
  </svg>
);
