"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { initializeSocket, disconnectSocket } from "@/utils/socket";
import { generateUserId } from "@/features/quiz/utils/lobbyHelpers";

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("🔌 SocketProvider: Initializing...");

    let userId = Cookies.get("user.id") || null;
    
    if (!userId) {
      userId = generateUserId();
      Cookies.set("user.id", userId, { expires: 365 });
      console.log("🆔 Generated new userId:", userId);
    } else {
      console.log("🆔 Using existing userId:", userId);
    }

    try {
      const socket = initializeSocket();
      
      console.log("✅ Socket initialized:", socket.id);

      socket.once("connect", () => {
        console.log("✅ Socket connected successfully");
        setIsReady(true);
      });

      if (socket.connected) {
        setIsReady(true);
      }

      // socket.on("connect_error", (error) => {
      //   console.error("🔴 Socket connection error:", error);
      //   setIsReady(true);
      // });

    } catch (error) {
      console.error("❌ Failed to initialize socket:", error);
      setIsReady(true);
    }

    return () => {
      console.log("🔌 SocketProvider: Cleaning up...");
      disconnectSocket();
    };
  }, []);

  // Optional: Show loading state while socket initializes
  // Remove this if you don't want to block rendering
  // if (!isReady) {
  //   return <div>Connecting...</div>;
  // }

  return <div>{children}</div>;
}

// ============================================
// HOW TO USE IN YOUR APP
// ============================================

/**
 * Add this to your root layout.tsx or _app.tsx:
 * 
 * // app/layout.tsx
 * import { SocketProvider } from "@/components/providers/SocketProvider";
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SocketProvider>
 *           {children}
 *         </SocketProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */

/**
 * Or in pages/_app.tsx for Pages Router:
 * 
 * import { SocketProvider } from "@/components/providers/SocketProvider";
 * 
 * function MyApp({ Component, pageProps }) {
 *   return (
 *     <SocketProvider>
 *       <Component {...pageProps} />
 *     </SocketProvider>
 *   );
 * }
 */