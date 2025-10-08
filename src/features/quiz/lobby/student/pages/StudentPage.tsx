"use client";

import { useState, useEffect } from "react";
import { SOCKET_EVENTS } from "@/features/quiz/constans/lobbyConstans";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { UseStudentLobbyList } from "../hooks";
import { getSocket, initializeSocket } from "@/utils/socket";
import { StudentLobbyList } from "../components/StudentLobbyList";
import LoadingWithCard from "@/features/quiz/components/dialog/LoadingWithCard";
import { generateUserId } from "@/features/quiz/utils/lobbyHelpers";
import Cookies from "js-cookie";

export default function StudentPage() {
  const [notification, setNotification] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [socketReady, setSocketReady] = useState<boolean>(false);

  useEffect(() => {
    let userId = Cookies.get("user.id") || null;
    
    if (!userId) {
      userId = generateUserId();
      Cookies.set("user.id", userId, { expires: 365 });
    }

    try {
      const socket = initializeSocket();
      
      if (socket.connected) {
        setSocketReady(true);
      } else {
        socket.once("connect", () => {
          console.log("✅ Socket connected and ready");
          setSocketReady(true);
        });
      }
    } catch (error) {
      console.error("❌ Failed to initialize socket:", error);
      setSocketReady(true);
    }
  }, []);

  const { lobbies, isJoining, joinLobby } = UseStudentLobbyList({
    onNotification: (title, description) =>
      setNotification(`${title}: ${description}`),
  });

  useEffect(() => {
    if (lobbies !== undefined && socketReady) {
      setIsLoading(false);
    }
  }, [lobbies, socketReady]);

  const showNotification = (msg: string) => setNotification(msg);
  const dismissNotification = () => setNotification("");

  const refreshLobbies = () => {
    setIsLoading(true);
    showNotification("Scanning for new missions...");

    const s = getSocket();

    s.emit(SOCKET_EVENTS.GET_LOBBIES);

    setTimeout(() => {
      setIsLoading(false);
      dismissNotification();
    }, 1500);
  };

  if (isLoading) {
    return <LoaderWithPlane />;
  }

  return (
    <LobbyHeader>
      <HeadMetaData title="Student Lobby" />

      <LoadingWithCard
        notification={notification}
        dismissNotification={dismissNotification}
      />

      <StudentLobbyList
        lobbies={lobbies}
        isJoining={isJoining}
        joinLobby={joinLobby}
        onRefresh={refreshLobbies}
      />
    </LobbyHeader>
  );
}