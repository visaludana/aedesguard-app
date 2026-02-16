'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function AnalyticsRedirect() {
  useEffect(() => {
    redirect('/admin-console');
  }, []);

  return null;
}
