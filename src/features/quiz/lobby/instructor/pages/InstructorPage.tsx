"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/utils/socket";
import Cookies from "js-cookie";
import { useInstructorLobbyList } from "../hooks";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { useNotification } from "@/features/quiz/context/NotificationContext";
import { SOCKET_EVENTS, STORAGE_KEYS } from "@/features/quiz/constans/lobbyConstans";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import CreateLobbyForm from "../components/CreateLobbyForm";
import InstructorLobbyList from "../components/InstructorLobbyList";

export default function InstructorPage() {
  const router = useRouter();
  const { showNotif } = useNotification();

  const [lobbyName, setLobbyName] = useState<string>("");
  const [lobbyDuration, setLobbyDuration] = useState<number>(0);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const {
    lobbies,
    instructorId,
    createLobby,
    joinLobby,
    startQuiz,
    endQuiz,
    deleteLobby,
  } = useInstructorLobbyList({
    onNotification: (title, description) => showNotif({ title, description }),
  });

  const handleCreateLobby = () => {
    setIsCreating(true);

    createLobby(
      lobbyName,
      lobbyDuration,
      (createdLobby) => {
        const s = getSocket();

        s.emit(SOCKET_EVENTS.JOIN_LOBBY, {
          lobbyId: createdLobby.id,
          userId: instructorId,
          username: Cookies.get("user.username") || "Instructor",
        });

        localStorage.setItem(STORAGE_KEYS.JOINED_LOBBY, createdLobby.id);

        showNotif({
          title: "Let's go!",
          description: `Lobby "${createdLobby.name}" created successfully!`,
        });

        setLobbyName("");
        setLobbyDuration(0);
        setIsCreating(false);

        router.push(`/lobby/instructor/${createdLobby.id}`);
      },
      (message) => {
        setIsCreating(false);
        showNotif({
          title: "Error",
          description: message,
        });
      }
    );
  };

  return (
    <LobbyHeader withBack>
      <HeadMetaData title="Instructor Lobby" />
      
      <CreateLobbyForm
        lobbyName={lobbyName}
        setLobbyName={setLobbyName}
        lobbyDuration={lobbyDuration}
        setLobbyDuration={setLobbyDuration}
        isCreating={isCreating}
        createLobby={handleCreateLobby}
      />

      <InstructorLobbyList
        sortedLobbies={lobbies}
        joinLobby={joinLobby}
        startQuiz={startQuiz}
        endQuiz={endQuiz}
        deleteLobby={deleteLobby}
      />
    </LobbyHeader>
  );
}
