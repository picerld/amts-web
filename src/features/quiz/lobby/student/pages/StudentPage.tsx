"use client";

import { useState, useEffect } from "react";
import { SOCKET_EVENTS } from "@/features/quiz/constans/lobbyConstans";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { UseStudentLobbyList } from "../hooks";
import { getSocket } from "@/utils/socket";
import { StudentLobbyList } from "../components/StudentLobbyList";
import LoadingWithCard from "@/features/quiz/components/dialog/LoadingWithCard";

export default function StudentPage() {
  const [notification, setNotification] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { lobbies, isJoining, joinLobby } = UseStudentLobbyList({
    onNotification: (title, description) =>
      setNotification(`${title}: ${description}`),
  });

  useEffect(() => {
    if (lobbies !== undefined) {
      setIsLoading(false);
    }
  }, [lobbies]);

  const showNotification = (msg: string) => setNotification(msg);
  const dismissNotification = () => setNotification("");

  const refreshLobbies = () => {
    setIsLoading(true);
    showNotification("Scanning for new lobbies...");

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
