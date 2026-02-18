'use client';

import { useState, useEffect } from 'react';

export type UserRole = 'loading' | 'public' | 'user' | 'officer';

/**
 * Temporary bypass for authentication and roles.
 * Forces the user into the 'officer' role to allow unrestricted testing.
 */
export function useUserRole(): UserRole {
  const [role, setRole] = useState<UserRole>('loading');

  useEffect(() => {
    // Immediate bypass
    setRole('officer');
  }, []);

  return role;
}
