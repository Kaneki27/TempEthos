'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/store';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user);
  const initSubscriptions = useStore((state) => state.initSubscriptions);
  const clearSubscriptions = useStore((state) => state.clearSubscriptions);

  useEffect(() => {
    // If user exists in Zustand store (loaded from localStorage on boot), start live streams
    if (user) {
      initSubscriptions();
    } else {
      clearSubscriptions();
    }
    
    return () => {
      clearSubscriptions();
    };
  }, [user, initSubscriptions, clearSubscriptions]);

  return <>{children}</>;
}
