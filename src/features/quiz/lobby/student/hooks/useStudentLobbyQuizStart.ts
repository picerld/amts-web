import { LobbyData } from "@/types/lobby";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { generateUserId } from "@/features/quiz/utils/lobbyHelpers";
import { getSocket, getCurrentUserId } from "@/utils/socket";
import {
  SOCKET_EVENTS,
  STORAGE_KEYS,
} from "@/features/quiz/constans/lobbyConstans";
import { IQuestion } from "@/types/question";
import { LobbyUser } from "@/types/lobbyUser";
import { trpc } from "@/utils/trpc";

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
    { questionId: number; answerId: number | null }[]
  >([]);
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [lobbyUser, setLobbyUser] = useState<LobbyUser | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<LobbyData | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [showResultDialog, setShowResultDialog] = useState<boolean>(false);

  const onNotificationRef = useRef(onNotification);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const answeredCount = selectedAnswers.length;
  const submitAnswerMutate = trpc.answer.submitUserAnswers.useMutation();

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (lobby?.status === "FINISHED") {
      setShowResultDialog(true);
    }
  }, [lobby?.status]);

  useEffect(() => {
    if (!lobbyId) return;

    const id = getCurrentUserId() || Cookies.get("user.id");

    if (!id) {
      const newId = generateUserId();
      Cookies.set("userId", newId, { expires: 365 });
      Cookies.set("user.id", newId, { expires: 365 });
      setUserId(newId);
    } else {
      setUserId(id);
    }

    loadSavedAnswers();

    const socket = getSocket();

    socket.onAny((event, payload) => {
      console.log("📡 SOCKET EVENT:", event, payload);
    });

    const savedLobby = localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY);
    if (savedLobby && savedLobby !== lobbyId) {
      router.push(`/lobby/student/${savedLobby}`);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.JOINED_LOBBY, lobbyId);

    const lobbyUpdateHandler = (updatedLobbies: LobbyData[]) => {
      const current = updatedLobbies.find((l) => l.id === lobbyId);

      if (!current) {
        console.error("❌ Lobby not found");
        setLoadingError(true);
        setIsLoading(false);
        clearLoadingTimeout();
        return;
      }

      handleLobbyStatusChange(current);
    };

    const lobbyUserUpdatedHandler = (updatedLobbyUser: LobbyUser) => {
      if (updatedLobbyUser.lobbyId === lobbyId) {
        setLobbyUser(updatedLobbyUser);
      }
    };

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
        cleanupQuizData();
        onNotificationRef.current(
          "Ended",
          `Mission "${lobby?.name}" has ended`
        );

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
        cleanupQuizData();
        onNotificationRef.current("Deleted", "Lobby was deleted");
        router.push("/lobby/student");
      }
    };

    const getQuestionsHandler = (receivedQuestions: IQuestion[]) => {
      console.log("📝 Questions received:", receivedQuestions?.length);
      if (receivedQuestions) {
        setQuestions(receivedQuestions);
      }
    };

    const quizSubmittedHandler = (updatedLobbyUser: LobbyUser) => {
      if (updatedLobbyUser.userId === id) {
        onNotificationRef.current(
          "Submitted",
          "Your answers have been submitted"
        );
        setLobbyUser(updatedLobbyUser);
        setShowResultDialog(true);
      }
    };

    socket.emit(SOCKET_EVENTS.GET_LOBBIES);
    socket.emit(SOCKET_EVENTS.GET_QUESTIONS, { lobbyId });
    socket.emit(SOCKET_EVENTS.GET_LOBBY_USER, { lobbyId, userId: id });

    timeoutRef.current = setTimeout(() => {
      setLoadingError(true);
      setIsLoading(false);
    }, 10000);

    socket.on(SOCKET_EVENTS.QUESTIONS, getQuestionsHandler);
    socket.on(SOCKET_EVENTS.LOBBY_USER_UPDATED, lobbyUserUpdatedHandler);
    socket.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdateHandler);
    socket.on(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
    socket.on(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
    socket.on(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
    socket.on(SOCKET_EVENTS.QUIZ_SUBMITTED, quizSubmittedHandler);

    return () => {
      clearLoadingTimeout();
      socket.off(SOCKET_EVENTS.QUESTIONS, getQuestionsHandler);
      socket.off(SOCKET_EVENTS.LOBBY_USER_UPDATED, lobbyUserUpdatedHandler);
      socket.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdateHandler);
      socket.off(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
      socket.off(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
      socket.off(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
      socket.off(SOCKET_EVENTS.QUIZ_SUBMITTED, quizSubmittedHandler);
    };
  }, [lobbyId, router]);

  const clearLoadingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const loadSavedAnswers = () => {
    const savedAnswers = localStorage.getItem(
      `${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`
    );

    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers).map(
          (a: { questionId: string; answerId: string }) => ({
            questionId: Number(a.questionId),
            answerId: Number(a.answerId),
          })
        );
        setSelectedAnswers(parsed);
        console.log("💾 Loaded saved answers:", parsed.length);
      } catch (error) {
        console.error("❌ Failed to load saved answers:", error);
      }
    }
  };

  const cleanupQuizData = () => {
    localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
    localStorage.removeItem(`${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`);
  };

  const handleLobbyStatusChange = (current: LobbyData) => {
    console.log("🔄 Lobby status:", current.status);

    switch (current.status) {
      case "ONGOING":
        setCurrentQuiz(current);
        setIsLoading(false);
        setLoadingError(false);
        break;

      case "WAITING":
        console.log("⏳ Quiz not started yet, redirecting to waiting room...");
        router.push(`/lobby/student/${lobbyId}`);
        break;

      case "FINISHED":
        setCurrentQuiz(current);
        setShowResultDialog(true);
        router.push(`/lobby/student/${lobbyId}/finished`);
        setIsLoading(false);
        setLoadingError(false);
        break;

      default:
        console.log("❓ Unknown status, redirecting to lobby list...");
        router.push("/lobby/student");
        break;
    }

    clearLoadingTimeout();
  };

  const handleAnswer = (questionId: number, answerId: number) => {
    const socket = getSocket();

    setSelectedAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== questionId);
      const updated = [...filtered, { questionId, answerId }];

      try {
        localStorage.setItem(
          `${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`,
          JSON.stringify(updated)
        );
      } catch (err) {
        console.error("❌ Failed to save quiz progress:", err);
      }

      socket.emit(SOCKET_EVENTS.STUDENT_ANSWERED, {
        lobbyId,
        userId,
        questionId,
        answerId,
      });

      return updated;
    });
  };

  const calculateScore = (): number => {
    if (!questions || questions.length === 0) return 0;

    return questions.reduce((score, question) => {
      const correctAnswer = question?.answers?.find((a) => a.isTrue);
      const userAnswer = selectedAnswers.find(
        (a) => a.questionId === Number(question.id)
      );

      if (!userAnswer || !correctAnswer) return score;

      return score + (userAnswer.answerId === correctAnswer.id ? 1 : 0);
    }, 0);
  };

  const handleReset = () => {
    setSelectedAnswers([]);
    localStorage.removeItem(`${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`);
  };

  const submitQuiz = async ({
    lobbyId,
    userId,
  }: {
    lobbyId: string;
    userId: string;
  }) => {
    if (!userId) {
      onNotificationRef.current("Error", "User ID not found");
      return;
    }

    const socket = getSocket();

    try {
      const answersArray = questions.map((q) => {
        const selected = selectedAnswers.find((a) => a.questionId === q.id);
        return {
          questionId: q.id,
          answerId: selected?.answerId ?? null,
        };
      });

      submitAnswerMutate.mutate({
        userId,
        answers: answersArray,
      });

      socket.emit(SOCKET_EVENTS.QUIZ_SUBMIT, { lobbyId, userId });

      console.log("✅ Quiz submission sent");
    } catch (error) {
      console.error("❌ Failed to submit answers:", error);
      onNotificationRef.current("Error", "Failed to submit quiz");
    }
  };

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
    score: calculateScore(),
    submitQuiz,
    handleAnswer,
    handleReset,
    setShowResultDialog,
  };
};
