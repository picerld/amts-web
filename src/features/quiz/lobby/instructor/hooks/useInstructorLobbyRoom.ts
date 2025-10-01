import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { getSocket } from "@/utils/socket";
import { LobbyData } from "@/types/lobby";
import { ChatMessage } from "@/features/quiz/types/chat-message";
import { generateInstructorId } from "@/features/quiz/utils/lobbyHelpers";
import {
  SOCKET_EVENTS,
  STORAGE_KEYS,
} from "@/features/quiz/constans/lobbyConstans";

interface UseInstructorLobbyRoomProps {
  lobbyId: string;
  onNotification: (title: string, description: string) => void;
}

export const useInstructorLobbyRoom = ({
  lobbyId,
  onNotification,
}: UseInstructorLobbyRoomProps) => {
  const router = useRouter();

  const [socket, setSocket] = useState<any>(null);

  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [chatInput, setChatInput] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [showResultDialog, setShowResultDialog] = useState<boolean>(false);

  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!lobbyId) return;

    const id = Cookies.get("user.id") ?? generateInstructorId();
    const username = Cookies.get("user.username") || "Instructor";
    setUserId(id);

    const s = getSocket();
    setSocket(s);

    s.emit(SOCKET_EVENTS.GET_LOBBIES);

    const lobbyUpdatedHandler = (updatedLobbies: LobbyData) => {
      setLobby(updatedLobbies);
    };

    const quizStartedHandler = (startedLobby: LobbyData) => {
      if (startedLobby.instructorId === id) {
        setLobby((prev) =>
          prev?.id === startedLobby.id
            ? { ...prev, status: "ONGOING", startTime: startedLobby.startTime }
            : prev
        );
      }
    };

    const quizEndedHandler = ({
      lobbyId: endedLobbyId,
    }: {
      lobbyId: string;
    }) => {
      setLobby((prev) =>
        prev?.id === endedLobbyId ? { ...prev, status: "FINISHED" } : prev
      );

      if (endedLobbyId === lobbyId) {
        setShowResultDialog(true);
      }
    };

    const lobbyDeletedHandler = ({
      lobbyId: deletedLobbyId,
    }: {
      lobbyId: string;
    }) => {
      if (deletedLobbyId === lobbyId) {
        router.push("/lobby/instructor");
      }
    };

    const bankUpdatedHandler = ({
      lobbyId: updatedLobbyId,
      bankId,
    }: {
      lobbyId: string;
      bankId: number;
    }) => {
      if (updatedLobbyId === lobbyId) {
        setLobby((prev) => {
          if (!prev) return prev;
          return { ...prev, bankId };
        });
      }
    };

    const emitJoin = () => {
      s.emit(SOCKET_EVENTS.JOIN_LOBBY, { lobbyId, userId: id, username });
      s.emit(SOCKET_EVENTS.GET_CHATS, lobbyId);
      s.emit(SOCKET_EVENTS.GET_LOBBIES);
    };

    if (!s.connected) {
      s.on("connect", emitJoin);
    } else {
      emitJoin();
    }

    const timeout = setTimeout(() => {
      setLoadingError(true);
      setIsLoading(false);
    }, 5000);

    const lobbiesUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      const current = updatedLobbies.find((l) => l.id === lobbyId);
      if (current) {
        setLobby(current);
        setIsLoading(false);
        setLoadingError(false);
        clearTimeout(timeout);
      }
    };

    const joinSuccessHandler = ({
      lobbyId: joinedId,
      lobbyName,
      lobby: lobbyData,
    }: {
      lobbyId: string;
      lobbyName: string;
      lobby?: LobbyData;
    }) => {
      if (joinedId === lobbyId) {
        onNotificationRef.current("Joined", `Joined "${lobbyName}"`);
        setLobby(
          lobbyData ?? {
            id: lobbyId,
            name: lobbyName,
            status: "ONGOING",
            duration: 0,
          }
        );
        setIsLoading(false);
        setLoadingError(false);
        clearTimeout(timeout);
      }
    };

    const leaveSuccessHandler = ({
      lobbyId: leftLobbyId,
    }: {
      lobbyId: string;
    }) => {
      if (leftLobbyId === lobbyId) {
        localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
        router.push("/lobby/instructor");
      }
    };

    const studentJoinedHandler = ({
      userId: joinedId,
      username: joinedUsername,
    }: {
      userId: string;
      username: string;
    }) => {
      if (joinedId === id) return;
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.type === "system" &&
            m.message === `${joinedUsername} has joined the mission.`
        );
        if (exists) return prev;
        const sysMsg: ChatMessage = {
          userId: "system",
          username: "Command",
          message: `${joinedUsername} has joined the mission.`,
          timestamp: new Date().toISOString(),
          type: "system",
          color: "green",
        };
        return [...prev, sysMsg];
      });
    };

    const chatHistoryHandler = (msgs: ChatMessage[]) => {
      const filtered = msgs.filter((msg) => {
        return !(
          msg.type === "system" &&
          msg.message.includes(username) &&
          msg.userId === "system"
        );
      });
      setMessages(filtered);
    };

    const chatMessageHandler = (msg: ChatMessage) =>
      setMessages((prev) => [...prev, msg]);

    const participantHandler = (username: string, type: "joined" | "left") => {
      const sysMsg: ChatMessage = {
        userId: "system",
        username: "System",
        message: `${username} ${type} the mission.`,
        timestamp: new Date().toISOString(),
        type: "system",
        color: type === "joined" ? "green" : "red",
      };
      setMessages((prev) => [...prev, sysMsg]);
    };

    s.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
    s.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbiesUpdatedHandler);
    s.on(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);
    s.on(SOCKET_EVENTS.CHAT_HISTORY, chatHistoryHandler);
    s.on(SOCKET_EVENTS.CHAT_MESSAGE, chatMessageHandler);
    s.on(SOCKET_EVENTS.STUDENT_JOINED, studentJoinedHandler);
    s.on(SOCKET_EVENTS.STUDENT_LEFT, ({ username }: { username: string }) =>
      participantHandler(username, "left")
    );
    s.on(SOCKET_EVENTS.LEAVE_SUCCESS, leaveSuccessHandler);
    s.on(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
    s.on(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
    s.on(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
    s.on(SOCKET_EVENTS.BANK_UPDATED, bankUpdatedHandler);

    return () => {
      clearTimeout(timeout);
      s.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
      s.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbiesUpdatedHandler);
      s.off(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);
      s.off(SOCKET_EVENTS.CHAT_HISTORY, chatHistoryHandler);
      s.off(SOCKET_EVENTS.CHAT_MESSAGE, chatMessageHandler);
      s.off(SOCKET_EVENTS.LEAVE_SUCCESS, leaveSuccessHandler);
      s.off(SOCKET_EVENTS.STUDENT_JOINED, studentJoinedHandler);
      s.off(SOCKET_EVENTS.STUDENT_LEFT);
      s.off(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
      s.off(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
      s.off(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
      s.off(SOCKET_EVENTS.BANK_UPDATED, bankUpdatedHandler);
    };
  }, [lobbyId, router]);

  useEffect(() => {
    if (lobby?.status === "FINISHED") {
      setShowResultDialog(true);
    }
  }, [lobby?.status]);

  const sendMessage = () => {
    if (!chatInput.trim() || !lobbyId || !socket) return;
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
      lobbyId,
      userId,
      username: Cookies.get("user.username") || "Anonymous",
      message: chatInput,
    });
    setChatInput("");
  };

  const startQuiz = () => {
    const s = getSocket();
    if (s) s.emit(SOCKET_EVENTS.START_QUIZ, { lobbyId });
    onNotificationRef.current("Started!", "Quiz started successfully!");
  };

  const endQuiz = () => {
    const s = getSocket();
    if (s) s.emit(SOCKET_EVENTS.END_QUIZ, { lobbyId });
  };

  const deleteLobby = () => {
    const s = getSocket();
    if (s) {
      s.emit(SOCKET_EVENTS.DELETE_LOBBY, {
        lobbyId,
        userId: Cookies.get("user.id") || "",
      });
    }
    onNotificationRef.current("Deleted!", "Lobby deleted successfully!");
  };

  const leaveLobby = () => {
    if (!socket || !lobbyId) return;
    socket.emit(SOCKET_EVENTS.LEAVE_LOBBY, {
      lobbyId,
      userId,
      username: Cookies.get("user.username") || "Anonymous",
    });
    onNotificationRef.current("Left!", "Left the lobby successfully!");
  };

  const updateLobbyBank = (lobbyId: string, bankId: number) => {
    const s = getSocket();
    if (s) {
      s.emit(SOCKET_EVENTS.UPDATE_LOBBY_BANK, { lobbyId, bankId });
    }
  };

  return {
    socket,
    lobby,
    messages,
    chatInput,
    setChatInput,
    userId,
    isLoading,
    loadingError,
    showResultDialog,
    setShowResultDialog,
    sendMessage,
    startQuiz,
    endQuiz,
    deleteLobby,
    leaveLobby,
    updateLobbyBank,
  };
};
