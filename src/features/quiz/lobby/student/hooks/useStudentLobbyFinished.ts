import { LobbyData } from "@/types/lobby";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { generateUserId } from "@/features/quiz/utils/lobbyHelpers";
import { getSocket } from "@/utils/socket";
import {
  SOCKET_EVENTS,
  STORAGE_KEYS,
} from "@/features/quiz/constans/lobbyConstans";
import { IQuestion } from "@/types/question";
import { LobbyUser } from "@/types/lobbyUser";

interface UseStudentLobbyFinishedProps {
  lobbyId: string;
  onNotification: (title: string, description: string) => void;
}

export const useStudentLobbyFinished = ({
  lobbyId,
  onNotification,
}: UseStudentLobbyFinishedProps) => {
  const router = useRouter();

  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [lobby, setLobby] = useState<LobbyData | null>(null);

  const [userId, setUserId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<boolean>(false);

  const onNotificationRef = useRef(onNotification);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!lobbyId) return;

    const id = Cookies.get("user.id") ?? generateUserId();
    setUserId(id);

    const s = getSocket();

    if (!s.connected) {
      s.connect();
    }

    s.onAny((event, payload) => {
      console.log("SOCKET EVENT:", event, payload);
    });

    const clearLoadingTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const lobbyUpdateHandler = (updatedLobbies: LobbyData[]) => {
      const current = updatedLobbies.find((l) => l.id === lobbyId);

      if (!current) {
        setLoadingError(true);
        setIsLoading(false);
        onNotificationRef.current("Error", "Lobby not found");
        setTimeout(() => router.push("/lobby/student"), 2000);
        return;
      }

      // If lobby is not finished, redirect to appropriate page
      if (current.status === "WAITING") {
        router.push(`/lobby/student/${lobbyId}`);
        return;
      } else if (current.status === "ONGOING") {
        router.push(`/lobby/student/${lobbyId}/start`);
        return;
      }

      setLobby(current);
      setIsLoading(false);
      setLoadingError(false);
      clearLoadingTimeout();
    };

    const lobbyUserUpdatedHandler = (updatedLobbyUser: LobbyData) => {
      if (updatedLobbyUser.id === lobbyId) {
        setLobby(updatedLobbyUser);
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

    const getQuestionsHandler = (questions: IQuestion[]) => {
      setQuestions(questions);
    };

    // Emit events to get data
    s.emit(SOCKET_EVENTS.GET_LOBBIES);
    s.emit(SOCKET_EVENTS.GET_QUESTIONS);
    s.emit(SOCKET_EVENTS.GET_LOBBY_USER, { lobbyId, userId: id });

    // Set timeout for loading
    timeoutRef.current = setTimeout(() => {
      setLoadingError(true);
      setIsLoading(false);
    }, 10000);

    // Register socket listeners
    s.on(SOCKET_EVENTS.QUESTIONS, getQuestionsHandler);
    s.on(SOCKET_EVENTS.LOBBY_USER_UPDATED, lobbyUserUpdatedHandler);
    s.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdateHandler);
    s.on(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);

    return () => {
      clearLoadingTimeout();
      s.off(SOCKET_EVENTS.QUESTIONS, getQuestionsHandler);
      s.off(SOCKET_EVENTS.LOBBY_USER_UPDATED, lobbyUserUpdatedHandler);
      s.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdateHandler);
      s.off(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
    };
  }, [lobbyId, router]);

  const getUserAnswer = (questionId: number): number | undefined => {
    if (!lobby?.bank?.questions) return undefined;
    const answer = lobby.bank.questions.find((a) => a.questionId === questionId);
    return answer?.id;
  };

  const isCorrectAnswer = (questionId: number): boolean => {
    const question = questions.find((q) => q.id === questionId);
    const userAnswerIndex = getUserAnswer(questionId);
    
    if (userAnswerIndex === undefined || !question) return false;

    const correctAnswer = question.answers?.find((a) => a.isTrue);
    const userAnswer = question.answers?.[userAnswerIndex];
    
    return userAnswer?.id === correctAnswer?.id;
  };

  const calculateScore = (): number => {
    if (!lobby?.bank?.questions || !questions.length) return 0;
    
    return questions.reduce((score, question) => {
      return score + (isCorrectAnswer(question.id) ? 1 : 0);
    }, 0);
  };

  const goBackToLobby = () => {
    localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
    localStorage.removeItem(`${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`);
    router.push("/lobby/student");
  };

  return {
    lobby,
    questions,
    userId,
    isLoading,
    loadingError,
    score: calculateScore(),
    totalQuestions: questions.length,
    getUserAnswer,
    isCorrectAnswer,
    goBackToLobby,
  };
};