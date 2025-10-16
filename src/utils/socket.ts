import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

let socket: Socket | null = null;
let currentUserId: string | null = null;
let userIdCheckInterval: NodeJS.Timeout | null = null;

export const getUserIdFromCookie = (): string | null => {
  return Cookies.get("user.id") || null;
};

/**
 * Initialize and get socket instance
 * Automatically reads userId from cookies if not provided
 */
export const getSocket = (): Socket => {
  if (typeof window === "undefined") {
    throw new Error("Socket cannot be initialized on the server");
  }

  const userId = getUserIdFromCookie();

  if (!socket) {
    socket = io("http://localhost:3000", {
      path: "/api/socket",
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);

      const uid = getUserIdFromCookie();

      if (uid) {
        socket?.emit("register-user", { userId: uid });
        console.log("👤 User registered:", uid);
        currentUserId = uid;
      } else {
        console.warn("⚠️ No userId found in cookies");
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);

      if (userIdCheckInterval) {
        clearInterval(userIdCheckInterval);
        userIdCheckInterval = null;
      }
    });

    // socket.on("connect_error", (error) => {
    //   console.error("🔴 Connection error:", error.message);
    // });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");

      const uid = getUserIdFromCookie();

      if (uid && socket) {
        socket.emit("register-user", { userId: uid });
        console.log("👤 User re-registered:", uid);
        currentUserId = uid;
      }
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Reconnection attempt:", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
      console.error("🔴 Reconnection error:", error.message);
    });

    socket.on("reconnect_failed", () => {
      console.error("🔴 Reconnection failed");
    });

    userIdCheckInterval = setInterval(() => {
      const newUserId = getUserIdFromCookie();

      if (newUserId && newUserId !== currentUserId && socket?.connected) {
        socket.emit("register-user", { userId: newUserId });
        console.log("👤 User re-registered with new ID:", newUserId);
        currentUserId = newUserId;
      }

      if (!newUserId && currentUserId && socket?.connected) {
        console.log("👋 User logged out, disconnecting socket");
        disconnectSocket();
      }
    }, 5000);
  }

  if (!socket.connected && userId) {
    console.log("🔌 Connecting socket...");
    socket.connect();
  } else if (!userId) {
    console.warn("⚠️ Cannot connect socket: No userId in cookies");
  }

  return socket;
};

/**
 * Initialize socket with user ID from cookies
 * Call this when user logs in or app initializes
 * @returns Socket instance
 * @throws Error if userId not found in cookies
 */
export const initializeSocket = (): Socket => {
  const userId = getUserIdFromCookie();

  if (!userId) {
    console.warn("⚠️ No userId found in cookies. Socket will not be initialized.");
    throw new Error("userId not found in cookies");
  }

  console.log("🚀 Initializing socket for user:", userId);
  currentUserId = userId;

  const socketInstance = getSocket();

  if (socketInstance.connected) {
    socketInstance.emit("register-user", { userId });
    console.log("👤 User registered immediately:", userId);
  } else {
    socketInstance.once("connect", () => {
      socketInstance.emit("register-user", { userId });
      console.log("👤 User registered on connect:", userId);
    });
  }

  return socketInstance;
};

/**
 * Disconnect and cleanup socket
 * Call this when user logs out
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");

    if (userIdCheckInterval) {
      clearInterval(userIdCheckInterval);
      userIdCheckInterval = null;
    }

    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
    currentUserId = null;

    console.log("✅ Socket disconnected and cleaned up");
  }
};

/**
 * Get current user ID from cookies
 * @returns userId or null if not found
 */
export const getCurrentUserId = (): string | null => {
  return getUserIdFromCookie();
};

/**
 * Check if socket is connected
 * @returns true if connected, false otherwise
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

/**
 * Reconnect socket if disconnected
 * Useful after logout/login
 */
export const reconnectSocket = (): void => {
  const userId = getUserIdFromCookie();

  if (!userId) {
    console.warn("⚠️ Cannot reconnect: No userId in cookies");
    return;
  }

  console.log("🔄 Reconnecting socket...");

  if (socket && !socket.connected) {
    socket.connect();
  } else {
    disconnectSocket();
    initializeSocket();
  }
};

/**
 * Get socket ID
 * @returns socket ID or null if not connected
 */
export const getSocketId = (): string | null => {
  return socket?.id ?? null;
};

/**
 * Emit event to server
 * @param event - Event name
 * @param data - Data to send
 */
export const emitEvent = (event: string, data?: any): void => {
  if (!socket || !socket.connected) {
    console.error("❌ Cannot emit event: Socket not connected");
    return;
  }

  socket.emit(event, data);
};

/**
 * Listen to event from server
 * @param event - Event name
 * @param callback - Callback function
 */
export const onEvent = (event: string, callback: (...args: any[]) => void): void => {
  if (!socket) {
    console.error("❌ Cannot listen to event: Socket not initialized");
    return;
  }

  socket.on(event, callback);
};

/**
 * Remove event listener
 * @param event - Event name
 * @param callback - Callback function (optional)
 */
export const offEvent = (event: string, callback?: (...args: any[]) => void): void => {
  if (!socket) {
    return;
  }

  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
};

/**
 * Listen to event once
 * @param event - Event name
 * @param callback - Callback function
 */
export const onceEvent = (event: string, callback: (...args: any[]) => void): void => {
  if (!socket) {
    console.error("❌ Cannot listen to event: Socket not initialized");
    return;
  }

  socket.once(event, callback);
};

// Export socket instance for advanced usage (use with caution)
export const getSocketInstance = (): Socket | null => {
  return socket;
};

// =======================================================================
// USAGE EXAMPLES
// =======================================================================

/**
 * Example 1: Initialize in root layout or _app.tsx
 * 
 * import { initializeSocket, disconnectSocket } from "@/utils/socket";
 * 
 * useEffect(() => {
 *   const userId = Cookies.get("userId");
 *   if (userId) {
 *     try {
 *       initializeSocket();
 *     } catch (error) {
 *       console.error("Failed to initialize socket:", error);
 *     }
 *   }
 *   
 *   return () => {
 *     disconnectSocket();
 *   };
 * }, []);
 */

/**
 * Example 2: Login component
 * 
 * import { initializeSocket } from "@/utils/socket";
 * import Cookies from "js-cookie";
 * 
 * const handleLogin = async (userId: string) => {
 *   // Set userId in cookie
 *   Cookies.set("user.id", userId, { expires: 7 });
 *   
 *   // Initialize socket
 *   initializeSocket();
 * };
 */

/**
 * Example 3: Logout component
 * 
 * import { disconnectSocket } from "@/utils/socket";
 * import Cookies from "js-cookie";
 * 
 * const handleLogout = () => {
 *   // Remove userId from cookie
 *   Cookies.remove("userId");
 *   
 *   // Disconnect socket
 *   disconnectSocket();
 * };
 */

/**
 * Example 4: Quiz component
 * 
 * import { getSocket, getCurrentUserId } from "@/utils/socket";
 * 
 * useEffect(() => {
 *   const socket = getSocket();
 *   
 *   socket.on("QUIZ_SUBMITTED", (data) => {
 *     console.log("Your quiz was submitted!", data);
 *   });
 *   
 *   return () => {
 *     socket.off("QUIZ_SUBMITTED");
 *   };
 * }, []);
 * 
 * const handleSubmit = () => {
 *   const socket = getSocket();
 *   const userId = getCurrentUserId();
 *   
 *   socket.emit("QUIZ_SUBMIT", { 
 *     lobbyId: "lobby-123", 
 *     userId 
 *   });
 * };
 */

/**
 * Example 5: Using helper functions
 * 
 * import { emitEvent, onEvent, offEvent } from "@/utils/socket";
 * 
 * // Emit event
 * emitEvent("JOIN_LOBBY", { lobbyId: "123", userId: "user-1" });
 * 
 * // Listen to event
 * const handler = (data) => console.log(data);
 * onEvent("LOBBY_UPDATED", handler);
 * 
 * // Remove listener
 * offEvent("LOBBY_UPDATED", handler);
 */