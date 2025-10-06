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

interface UseStudentLobbyQuizStartProps {
  lobbyId: string;
  onNotification: (title: string, description: string) => void;
}

export const useStudentLobbyQuizStart = ({
  lobbyId,
  onNotification,
}: UseStudentLobbyQuizStartProps) => {
  const router = useRouter();

  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number> // questionId: answerId
  >({});

  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [lobbyUser, setLobbyUser] = useState<LobbyUser | null>(null);

  const [currentQuiz, setCurrentQuiz] = useState<LobbyData | null>(null);
  const [userId, setUserId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [showResultDialog, setShowResultDialog] = useState<boolean>(false);

  const onNotificationRef = useRef(onNotification);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const answeredCount = Object.keys(selectedAnswers).length;

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!lobbyId) return;

    const id = Cookies.get("user.id") ?? generateUserId();
    const username = Cookies.get("user.username") || "Anonymous";
    setUserId(id);

    const savedAnswers = localStorage.getItem(
      `${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`
    );
    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers));
    }

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

      if (!current) {
        setLoadingError(true);
        setIsLoading(false);
        return;
      }

      switch (current.status) {
        case "ONGOING":
          setCurrentQuiz(current);
          break;
        case "WAITING":
          router.push(`/lobby/student/${lobbyId}`);
          return;
        case "FINISHED":
          setCurrentQuiz(current);
          setShowResultDialog(true);
          break;
        default:
          router.push("/lobby/student");
          break;
      }

      setIsLoading(false);
      setLoadingError(false);
      clearLoadingTimeout();
    };

    const lobbyUserUpdatedHandler = (updatedLobbyUser: LobbyUser) => {
      console.log(updatedLobbyUser);
      if (updatedLobbyUser.lobbyId == lobbyId) {
        setLobbyUser(updatedLobbyUser);
      }
    }

    const quizStartedHandler = (updatedLobby: LobbyData) => {
      if (updatedLobby.id === lobbyId) {
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
        localStorage.removeItem(`${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`);

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

    const getQuestionsHandler = (questions: IQuestion[]) => {
      setQuestions(questions);
    };

    const quizSubmittedHandler = (lobbyUser: LobbyUser) => {
      onNotificationRef.current("Submitted", "Submitted answers");
      setLobbyUser(lobbyUser);

      setShowResultDialog(true);
    };

    s.emit(SOCKET_EVENTS.GET_LOBBIES);
    s.emit(SOCKET_EVENTS.GET_QUESTIONS);
    s.emit(SOCKET_EVENTS.GET_LOBBY_USER, { lobbyId, userId: id });

    timeoutRef.current = setTimeout(() => {
      setLoadingError(true);
      setIsLoading(false);
    }, 10000);

    s.on(SOCKET_EVENTS.QUESTIONS, getQuestionsHandler);
    s.on(SOCKET_EVENTS.LOBBY_USER_UPDATED, lobbyUserUpdatedHandler);
    s.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdateHandler);
    s.on(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
    s.on(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
    s.on(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
    s.on(SOCKET_EVENTS.QUIZ_SUBMITTED, quizSubmittedHandler);

    return () => {
      clearLoadingTimeout();
      s.off(SOCKET_EVENTS.QUESTIONS, getQuestionsHandler);
      s.off(SOCKET_EVENTS.LOBBY_USER_UPDATED, lobbyUserUpdatedHandler);
      s.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdateHandler);
      s.off(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
      s.off(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
      s.off(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
      s.off(SOCKET_EVENTS.QUIZ_SUBMITTED, quizSubmittedHandler);
    };
  }, [lobbyId, router]);

  useEffect(() => {
    if (lobby?.status === "FINISHED") {
      setShowResultDialog(true);
    }
  }, [lobby?.status]);

  const handleAnswer = (questionId: number, answerIndex: number) => {
    const s = getSocket();

    setSelectedAnswers((prev) => {
      const updated = { ...prev, [questionId]: answerIndex };
      localStorage.setItem(
        `${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`,
        JSON.stringify(updated)
      );

      s.emit(SOCKET_EVENTS.STUDENT_ANSWERED, {
        lobbyId,
        userId,
        questionId,
        answerIndex,
      });

      return updated;
    });
  };

  const calculateScore = (answers: Record<number, number>) => {
    // questionId => answerId == question.answers.isTrue

    return questions.reduce((score, question) => {
      const correctAnswer = question?.answers?.find((a) => a.isTrue);
      const userAnswerId = answers[question.id];
      return score + (userAnswerId === correctAnswer?.id ? 1 : 0);
    }, 0);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    localStorage.removeItem(`${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`);
  };

  const submitQuiz = ({ lobbyId, userId }: { lobbyId: string; userId: string }) => {
    const s = getSocket();
    s.emit(SOCKET_EVENTS.QUIZ_SUBMIT, { lobbyId, userId });
  }

  return {
    lobby,
    lobbyUser,
    questions,
    currentQuiz,
    userId,
    isLoading,
    loadingError,
    showResultDialog,
    answeredCount,
    selectedAnswers,
    submitQuiz,
    handleAnswer,
    handleReset,
    calculateScore,
    setShowResultDialog,
  };
};