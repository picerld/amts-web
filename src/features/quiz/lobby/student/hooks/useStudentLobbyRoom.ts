import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { getSocket } from "@/utils/socket";
import { LobbyData } from "@/types/lobby";
import { ChatMessage } from "@/features/quiz/types/chat-message";
import { generateUserId } from "@/features/quiz/utils/lobbyHelpers";
import {
  SOCKET_EVENTS,
  STORAGE_KEYS,
} from "@/features/quiz/constans/lobbyConstans";

interface UseStudentLobbyRoomProps {
  lobbyId: string;
  onNotification: (title: string, description: string) => void;
}

export const useStudentLobbyRoom = ({
  lobbyId,
  onNotification,
}: UseStudentLobbyRoomProps) => {
  const router = useRouter();

  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [chatInput, setChatInput] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const [isLeaving, setIsLeaving] = useState<boolean>(false);

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
    const username = Cookies.get("user.username") || "Student";
    setUserId(id);

    const s = getSocket();

    const savedLobby = localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY);
    
    if (savedLobby && savedLobby !== lobbyId) {
      router.push(`/lobby/student/${savedLobby}`);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.JOINED_LOBBY, lobbyId);

    const clearLoadingTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      const currentLobby = updatedLobbies.find((l) => l.id === lobbyId);
      if (currentLobby) {
        setLobby(currentLobby);
        setIsLoading(false);
        setLoadingError(false);
        clearLoadingTimeout();
      }
    };

    const joinSuccessHandler = ({
      lobbyId: joinedLobbyId,
      lobbyName,
      lobbyData,
    }: {
      lobbyId: string;
      lobbyName: string;
      lobbyData?: LobbyData;
    }) => {
      if (joinedLobbyId === lobbyId) {
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
        clearLoadingTimeout();
      }
    };

    const joinErrorHandler = ({ message }: { message: string }) => {
      console.error("Join error:", message);
      setIsLoading(false);
      setLoadingError(true);
      clearLoadingTimeout();
    };

    const leaveSuccessHandler = ({
      lobbyId: leftLobbyId,
    }: {
      lobbyId: string;
    }) => {
      if (leftLobbyId === lobbyId) {
        localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
        setIsLeaving(false);
        onNotificationRef.current("Left", `Left "${lobby?.name}"`);
        router.push("/lobby/student");
      }
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

    const chatMessageHandler = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
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

    const studentLeftHandler = ({
      userId: leavingUserId,
      username: leftUsername,
    }: {
      userId: string;
      username: string;
    }) => {
      if (leavingUserId === id) return;
      const sysMsg: ChatMessage = {
        userId: "system",
        username: "Command",
        message: `${leftUsername} has left the mission.`,
        timestamp: new Date().toISOString(),
        type: "system",
        color: "red",
      };
      setMessages((prev) => [...prev, sysMsg]);
    };

    const quizStartedHandler = (updatedLobby: LobbyData) => {
      console.log("Started", updatedLobby);
      if (updatedLobby.id == lobbyId) {
        onNotificationRef.current("Started", `Started "${updatedLobby.name}"`);
        router.push(`/lobby/student/${lobbyId}/start`);
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
        setShowResultDialog(true);
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

    // Handle connection
    if (!s.connected) {
      s.on("connect", emitJoin);
    } else {
      emitJoin();
    }

    timeoutRef.current = setTimeout(() => {
      setLoadingError(true);
      setIsLoading(false);
    }, 10000);

    s.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
    s.on(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);
    s.on(SOCKET_EVENTS.JOIN_ERROR, joinErrorHandler);
    s.on(SOCKET_EVENTS.CHAT_HISTORY, chatHistoryHandler);
    s.on(SOCKET_EVENTS.CHAT_MESSAGE, chatMessageHandler);
    s.on(SOCKET_EVENTS.STUDENT_JOINED, studentJoinedHandler);
    s.on(SOCKET_EVENTS.STUDENT_LEFT, studentLeftHandler);
    s.on(SOCKET_EVENTS.LEAVE_SUCCESS, leaveSuccessHandler);
    s.on(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
    s.on(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
    s.on(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
    s.on(SOCKET_EVENTS.BANK_UPDATED, bankUpdatedHandler);

    return () => {
      clearLoadingTimeout();
      s.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
      s.off(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);
      s.off(SOCKET_EVENTS.JOIN_ERROR, joinErrorHandler);
      s.off(SOCKET_EVENTS.CHAT_HISTORY, chatHistoryHandler);
      s.off(SOCKET_EVENTS.CHAT_MESSAGE, chatMessageHandler);
      s.off(SOCKET_EVENTS.LEAVE_SUCCESS, leaveSuccessHandler);
      s.off(SOCKET_EVENTS.STUDENT_JOINED, studentJoinedHandler);
      s.off(SOCKET_EVENTS.STUDENT_LEFT, studentLeftHandler);
      s.off(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
      s.off(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
      s.off(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
      s.off(SOCKET_EVENTS.BANK_UPDATED, bankUpdatedHandler);
      s.off("connect", emitJoin);
    };
  }, [lobbyId, router]);

  useEffect(() => {
    if (lobby?.status === "FINISHED") {
      setShowResultDialog(true);
    }
  }, [lobby?.status]);

  const sendMessage = () => {
    const s = getSocket();

    if (!chatInput.trim() || !lobbyId) return;

    if (s)
      s.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
        lobbyId,
        userId,
        message: chatInput,
      });
    setChatInput("");
  };

  const leaveLobby = () => {
    const s = getSocket();
    if (!lobbyId) return;

    setIsLeaving(true);
    s.emit(SOCKET_EVENTS.LEAVE_LOBBY, {
      lobbyId,
      userId,
      username: Cookies.get("user.username") || "Anonymous",
    });
  };

  return {
    lobby,
    messages,
    isLeaving,
    chatInput,
    userId,
    isLoading,
    loadingError,
    showResultDialog,
    setIsLoading,
    setChatInput,
    setShowResultDialog,
    sendMessage,
    leaveLobby,
  };
};
