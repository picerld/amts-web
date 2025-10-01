import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getSocket } from "@/utils/socket";
import { LobbyData } from "@/types/lobby";
import {
  generateUserId,
  sortLobbies,
} from "@/features/quiz/utils/lobbyHelpers";
import {
  SOCKET_EVENTS,
  STORAGE_KEYS,
} from "@/features/quiz/constans/lobbyConstans";

interface UseStudentLobbyListProps {
  onNotification: (title: string, description: string) => void;
}

export const UseStudentLobbyList = ({
  onNotification,
}: UseStudentLobbyListProps) => {
  const router = useRouter();

  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  const studentId = Cookies.get("user.id") ?? generateUserId();

  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    const s = getSocket();

    const savedLobby = localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY);

    if (savedLobby) {
      router.push(`/lobby/student/${savedLobby}`);
      return;
    }

    s.emit(SOCKET_EVENTS.GET_LOBBIES);

    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      setLobbies(updatedLobbies);
    };

    const lobbyCreatedHandler = (createdLobby: LobbyData) => {
      setLobbies((prev) => [...prev, createdLobby]);
    };

    const lobbyDeletedHandler = ({ lobbyId }: { lobbyId: string }) => {
      setLobbies((prev) => prev.filter((l) => l.id !== lobbyId));

      if (localStorage.getItem("joinedLobby") === lobbyId) {
        localStorage.removeItem("joinedLobby");
      }
    };

    const quizStartedHandler = (startedLobby: LobbyData) => {
      const currentLobbyId = localStorage.getItem("joinedLobby");

      if (currentLobbyId === startedLobby.id) {
        router.push(`/lobby/student/${startedLobby.id}/start`);
      }
    };

    const quizEndedHandler = ({ lobbyId }: { lobbyId: string }) => {
      if (localStorage.getItem("joinedLobby") === lobbyId) {
        localStorage.removeItem("joinedLobby");
      }

      s.emit(SOCKET_EVENTS.GET_LOBBIES);
    };

    const joinSuccessHandler = ({ lobbyId }: { lobbyId: string }) => {
      setIsJoining(null);
      localStorage.setItem("joinedLobby", lobbyId);

      s.emit(SOCKET_EVENTS.GET_LOBBIES);
      router.push(`/lobby/student/${lobbyId}`);
    };

    const joinErrorHandler = ({ message }: any) => {
      console.error("Join error:", message);
      setIsJoining(null);
    };

    s.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
    s.on(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
    s.on(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
    s.on(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
    s.on(SOCKET_EVENTS.LOBBY_CREATED, lobbyCreatedHandler);
    s.on(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);
    s.on(SOCKET_EVENTS.JOIN_ERROR, joinErrorHandler);

    return () => {
      s.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
      s.off(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
      s.off(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
      s.off(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
      s.off(SOCKET_EVENTS.LOBBY_CREATED, lobbyCreatedHandler);
      s.off(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);
      s.off(SOCKET_EVENTS.JOIN_ERROR, joinErrorHandler);
    };
  }, [studentId, router]);

  const joinLobby = (lobbyId: string, status: string) => {
    const s = getSocket();

    if (isJoining?.includes(lobbyId)) {
      router.push(`/lobby/student/${lobbyId}`);
      return;
    }

    if (status === "FINISHED") {
      alert("This mission has already ended. You cannot join.");
      return;
    }

    if (status === "ONGOING") {
      alert("This mission has already started. You cannot join.");
      return;
    }

    setIsJoining(lobbyId);

    s.emit(SOCKET_EVENTS.JOIN_LOBBY, {
      lobbyId,
      userId: studentId,
      username: Cookies.get("user.username") || "Anonymous",
    });
  };

  return {
    lobbies: sortLobbies(lobbies),
    studentId,
    joinLobby,
    isJoining,
  };
};
