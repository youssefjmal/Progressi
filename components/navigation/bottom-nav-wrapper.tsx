'use client';

import { BottomNav } from './bottom-nav';
import { useEffect, useState } from 'react';

export function BottomNavWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <BottomNav />;
}
