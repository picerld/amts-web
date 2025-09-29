// hooks/usePageCleanup.js
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { disconnectSocket, emitWithCheck } from '@/utils/socket';
import Cookies from 'js-cookie';

export const usePageCleanup = (lobbyId, userId) => {
  const router = useRouter();
  const cleanupExecuted = useRef(false);
  const beforeUnloadExecuted = useRef(false);

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      // Only cleanup if we're leaving this specific page
      if (!url.includes(`/lobby/student/${lobbyId}`) && !cleanupExecuted.current) {
        executeCleanup();
        cleanupExecuted.current = true;
      }
    };

    const handleBeforeUnload = (e) => {
      if (!beforeUnloadExecuted.current) {
        executeCleanup();
        beforeUnloadExecuted.current = true;
      }
    };

    const executeCleanup = () => {
      if (lobbyId && userId) {
        // Send leave event before disconnecting
        emitWithCheck("leave-lobby", {
          lobbyId,
          userId,
          username: Cookies.get("user.username") || "Anonymous",
        });
        
        // Small delay to ensure leave event is sent
        setTimeout(() => {
          disconnectSocket();
        }, 100);
      }
    };

    // Add event listeners
    router.events.on('routeChangeStart', handleRouteChangeStart);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also handle page visibility changes (e.g., closing tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !cleanupExecuted.current) {
        executeCleanup();
        cleanupExecuted.current = true;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Remove event listeners
      router.events.off('routeChangeStart', handleRouteChangeStart);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Final cleanup
      if (!cleanupExecuted.current) {
        executeCleanup();
      }
    };
  }, [router, lobbyId, userId]);

  return { cleanupExecuted: cleanupExecuted.current };
};