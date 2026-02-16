'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type UserRole = 'loading' | 'public' | 'user' | 'officer';

export function useUserRole(): UserRole {
  const { user, isUserLoading, firestore } = useFirebase();
  const [role, setRole] = useState<UserRole>('loading');

  useEffect(() => {
    if (isUserLoading) {
      setRole('loading');
      return;
    }

    if (!user) {
      setRole('public');
      return;
    }

    if (firestore) {
      const phiDocRef = doc(firestore, 'roles_phi', user.uid);
      getDoc(phiDocRef).then(docSnap => {
        setRole(docSnap.exists() ? 'officer' : 'user');
      }).catch(() => {
        setRole('user'); // Fallback on error
      });
    } else {
      setRole('user'); // Fallback if firestore not ready
    }
  }, [user, isUserLoading, firestore]);

  return role;
}
