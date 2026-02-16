'use client';

import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AedesGuardLogo } from '@/components/icons';

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading, firestore } = useFirebase();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user auth state is resolved
    }

    if (!user) {
      router.replace('/dashboard'); // Public dashboard for anonymous users
      return;
    }

    // User is authenticated, check for PHI role
    if (firestore) {
      const phiDocRef = doc(firestore, 'roles_phi', user.uid);
      getDoc(phiDocRef).then(docSnap => {
        if (docSnap.exists()) {
          router.replace('/officer-dashboard');
        } else {
          router.replace('/user-dashboard');
        }
      }).catch(err => {
          console.error("Error checking user role:", err);
          router.replace('/user-dashboard'); // Fallback to user dashboard
      });
    } else {
        // Fallback if firestore not ready yet
        // This can happen on first load, so we wait for the effect to re-trigger
    }

  }, [user, isUserLoading, router, firestore]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-sm p-8 space-y-6 flex flex-col items-center">
            <AedesGuardLogo className="h-16 w-16 text-primary" />
            <h1 className="text-2xl font-bold text-center">AedesGuard AI</h1>
            <p className="text-center text-muted-foreground">Securing your dashboard...</p>
            <div className='w-full pt-4 space-y-2'>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
            </div>
        </div>
    </div>
  );
}
