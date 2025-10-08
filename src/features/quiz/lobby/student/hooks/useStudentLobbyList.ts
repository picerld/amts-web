import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getSocket, getCurrentUserId } from "@/utils/socket";
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

  const userId = getCurrentUserId() || Cookies.get("user.id");
  
  useEffect(() => {
    if (!userId) {
      const newUserId = generateUserId();
      Cookies.set("user.id", newUserId, { expires: 365 });
    }
  }, [userId]);

  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!userId) return;

    const s = getSocket();

    const savedLobby = localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY);

    if (savedLobby) {
      router.push(`/lobby/student/${savedLobby}`);
      return;
    }

    s.emit(SOCKET_EVENTS.GET_LOBBIES);

    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      console.log("📋 Lobbies updated:", updatedLobbies.length);
      setLobbies(updatedLobbies);
    };

    const lobbyCreatedHandler = (createdLobby: LobbyData) => {
      console.log("✨ New lobby created:", createdLobby.name);
      setLobbies((prev) => {
        // Prevent duplicates
        if (prev.some(l => l.id === createdLobby.id)) {
          return prev;
        }
        return [...prev, createdLobby];
      });
    };

    const lobbyDeletedHandler = ({ lobbyId }: { lobbyId: string }) => {
      console.log("🗑️ Lobby deleted:", lobbyId);
      setLobbies((prev) => prev.filter((l) => l.id !== lobbyId));

      if (localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY) === lobbyId) {
        localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
        onNotificationRef.current(
          "Lobby Closed",
          "The mission you were in has been closed."
        );
      }
    };

    const quizStartedHandler = (startedLobby: LobbyData) => {
      console.log("🎯 Quiz started:", startedLobby.name);
      const currentLobbyId = localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY);

      if (currentLobbyId === startedLobby.id) {
        onNotificationRef.current(
          "Quiz Started!",
          "The mission has begun. Redirecting..."
        );
        router.push(`/lobby/student/${startedLobby.id}/start`);
      }
    };

    const quizEndedHandler = ({ lobbyId }: { lobbyId: string }) => {
      console.log("⏱️ Quiz ended:", lobbyId);
      
      if (localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY) === lobbyId) {
        localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
        onNotificationRef.current(
          "Quiz Ended",
          "The mission has concluded."
        );
      }

      s.emit(SOCKET_EVENTS.GET_LOBBIES);
    };

    const joinSuccessHandler = ({ lobbyId }: { lobbyId: string }) => {
      console.log("✅ Successfully joined lobby:", lobbyId);
      setIsJoining(null);
      localStorage.setItem(STORAGE_KEYS.JOINED_LOBBY, lobbyId);

      onNotificationRef.current(
        "Joined!",
        "Successfully joined the mission."
      );

      s.emit(SOCKET_EVENTS.GET_LOBBIES);
      router.push(`/lobby/student/${lobbyId}`);
    };

    const joinErrorHandler = ({ message }: { message: string }) => {
      console.error("❌ Join error:", message);
      setIsJoining(null);
      
      onNotificationRef.current(
        "Join Failed",
        message || "Could not join the mission."
      );
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
  }, [userId, router]);

  const joinLobby = (lobbyId: string, status: string) => {
    if (!userId) {
      alert("Please refresh the page and try again.");
      return;
    }

    const s = getSocket();

    if (isJoining?.includes(lobbyId)) {
      router.push(`/lobby/student/${lobbyId}`);
      return;
    }

    if (status === "FINISHED") {
      onNotificationRef.current(
        "Mission Ended",
        "This mission has already ended. You cannot join."
      );
      return;
    }

    if (status === "ONGOING") {
      onNotificationRef.current(
        "Mission In Progress",
        "This mission has already started. You cannot join."
      );
      return;
    }

    setIsJoining(lobbyId);

    s.emit(SOCKET_EVENTS.JOIN_LOBBY, {
      lobbyId,
      userId: userId,
      username: Cookies.get("user.username") || "Anonymous",
    });
  };

  return {
    lobbies: sortLobbies(lobbies),
    studentId: userId,
    joinLobby,
    isJoining,
  };
};