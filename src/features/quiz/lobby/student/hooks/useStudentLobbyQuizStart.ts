import { LobbyData } from "@/types/lobby";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { generateUserId } from "@/features/quiz/utils/lobbyHelpers";
import { getSocket } from "@/utils/socket";
import { SOCKET_EVENTS, STORAGE_KEYS } from "@/features/quiz/constans/lobbyConstans";

interface UseStudentLobbyQuizStartProps {
  lobbyId: string;
  onNotification: (title: string, description: string) => void;
}

export const useStudentLobbyQuizStart = ({
  lobbyId,
  onNotification,
}: UseStudentLobbyQuizStartProps) => {
  const router = useRouter();

  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<LobbyData | null>(null);
  const [userId, setUserId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [showResultDialog, setShowResultDialog] = useState<boolean>(false);

  const onNotificationRef = useRef(onNotification);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!lobbyId) return;

    const id = Cookies.get("user.id") ?? generateUserId();
    const username = Cookies.get("user.username") || "Anonymous";
    setUserId(id);

    const s = getSocket();

    if (!s.connected) {
      s.connect();
    }

    s.onAny((event, payload) => {
      console.log("SOCKET EVENT:", event, payload);
    });

    const savedLobby = localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY);
    if (savedLobby && savedLobby !== lobbyId) {
      router.push(`/lobby/student/${savedLobby}`);
      return;
    }

    if (savedLobby && savedLobby == lobbyId) {
      router.push(`/lobby/student/${savedLobby}/start`);
    }

    localStorage.setItem(STORAGE_KEYS.JOINED_LOBBY, lobbyId);

    const clearLoadingTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const lobbyUpdateHandler = (updatedLobbies: LobbyData[]) => {
      const current = updatedLobbies.find((l) => l.id === lobbyId);
      console.log("LOBBY_UPDATED received:", current);

      if (!current) {
        setLoadingError(true);
        setIsLoading(false);
        return;
      }

      if (current.status === "ONGOING") {
        setCurrentQuiz(current);
      } else if (current.status === "WAITING") {
        router.push(`/lobby/student/${lobbyId}`);
        return;
      } else {
        router.push("/lobby/student");
        return;
      }

      setIsLoading(false);
      setLoadingError(false);
      clearLoadingTimeout();
    };

    const quizStartedHandler = (updatedLobby: LobbyData) => {
      if (updatedLobby.id === lobbyId) {
        console.log("QUIZ_STARTED:", updatedLobby);
        setCurrentQuiz(updatedLobby);
        setLobby(updatedLobby);
        onNotificationRef.current(
          "Started",
          `Mission "${updatedLobby.name}" is now active!`
        );
      }
    };

    const quizEndedHandler = ({
      lobbyId: endedLobbyId,
    }: {
      lobbyId: string;
    }) => {
      if (endedLobbyId === lobbyId) {
        localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
        onNotificationRef.current("Ended", `Ended "${lobby?.name}"`);

        setTimeout(() => {
          router.push("/lobby/student");
        }, 3000);
      }
    };

    const lobbyDeletedHandler = ({
      lobbyId: deletedLobbyId,
    }: {
      lobbyId: string;
    }) => {
      if (deletedLobbyId === lobbyId) {
        localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
        onNotificationRef.current("Deleted", "Lobby was deleted");
        router.push("/lobby/student");
      }
    };

    s.emit(SOCKET_EVENTS.GET_LOBBIES);

    timeoutRef.current = setTimeout(() => {
      console.warn("No lobby data received in time");
      setLoadingError(true);
      setIsLoading(false);
    }, 10000);

    s.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdateHandler);
    s.on(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
    s.on(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
    s.on(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);

    return () => {
      clearLoadingTimeout();
      s.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdateHandler);
      s.off(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
      s.off(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
      s.off(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
    };
  }, [lobbyId, router]);

  useEffect(() => {
    if (lobby?.status === "FINISHED") {
      setShowResultDialog(true);
    }
  }, [lobby?.status]);

  return {
    lobby,
    currentQuiz,
    userId,
    isLoading,
    loadingError,
    showResultDialog,
    setShowResultDialog,
  };
};
