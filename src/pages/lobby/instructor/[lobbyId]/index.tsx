"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getSocket } from "@/utils/socket";
import { LobbyData } from "@/types/lobby";
import LobbyHeader from "@/features/quizz/components/container/LobbyHeader";
import { useNotification } from "@/features/quizz/context/NotificationContext";
import { InstructorLobbyContainer } from "@/features/quizz/lobby/instructor/pages/InstructorLobbyContainer";
import { ChatMessage } from "@/features/quizz/types/chat-message";
import { trpc } from "@/utils/trpc";
import {
  BarChart3,
  Plane,
  Radar,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ButtonQuiz } from "@/features/quizz/components/ui/button-quiz";

export default function InstructorLobbyRoom() {
  const router = useRouter();
  const { lobbyId } = router.query;

  const { showNotif } = useNotification();

  const [socket, setSocket] = useState<any>(null);
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<boolean>(false);

  const [showResultDialog, setShowResultDialog] = useState<boolean>(false);

  const lobbyIdStr = Array.isArray(lobbyId) ? lobbyId[0] : lobbyId;

  const { data: subjects, isLoading: isLoadingSubject } =
    trpc.bank.getAll.useQuery();

  useEffect(() => {
    if (!router.isReady || !lobbyIdStr) return;

    const id =
      Cookies.get("user.id") ??
      "instructor-" + Math.floor(Math.random() * 1000);
    const username = Cookies.get("user.username") || "Instructor";
    setUserId(id);

    const s = getSocket();
    setSocket(s);

    s.emit("get-lobbies");

    s.on("lobby-updated", (updatedLobbies: LobbyData) => {
      setLobby(updatedLobbies);
    });

    s.on("quiz-started", (startedLobby: LobbyData) => {
      if (startedLobby.instructorId === id) {
        setLobby((prev) =>
          prev?.id === startedLobby.id
            ? { ...prev, status: "ONGOING", startTime: startedLobby.startTime }
            : prev
        );
      }
    });

    s.on("quiz-ended", ({ lobbyId }) => {
      setLobby((prev) =>
        prev?.id === lobbyId ? { ...prev, status: "FINISHED" } : prev
      );

      if (lobbyId === lobbyIdStr) {
        setShowResultDialog(true);
      }
    });

    s.on("lobby-deleted", ({ lobbyId }) => {
      if (lobbyId === lobbyIdStr) {
        router.push("/lobby/instructor");
      }
    });

    s.on("bank-updated", ({ lobbyId: updatedLobbyId, bankId }) => {
      console.log("Bank updated event received:", updatedLobbyId, bankId);
      if (updatedLobbyId === lobbyIdStr) {
        setLobby((prev) => {
          if (!prev) return prev;
          console.log("Updating lobby bankId from", prev.bankId, "to", bankId);
          return { ...prev, bankId };
        });
      }
    });

    const emitJoin = () => {
      s.emit("join-lobby", { lobbyId: lobbyIdStr, userId: id, username });
      s.emit("get-chats", lobbyIdStr);
      s.emit("get-lobbies");
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

    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      const current = updatedLobbies.find((l) => l.id === lobbyIdStr);
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
      if (joinedId === lobbyIdStr) {
        showNotif({ title: "Joined", description: `Joined "${lobbyName}"` });
        setLobby(
          lobbyData ?? {
            id: lobbyIdStr,
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
        localStorage.removeItem("joinedLobby");
        router.push("/lobby/instructor");
      }
    };

    const studentJoinedHandler = ({
      userId: joinedId,
      username: joinedUsername,
    }: any) => {
      if (joinedId === userId) return;
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

    s.on("lobby-updated", lobbyUpdatedHandler);
    s.on("join-success", joinSuccessHandler);
    s.on("chat-history", chatHistoryHandler);
    s.on("chat-message", chatMessageHandler);
    s.on("student-joined", studentJoinedHandler);
    s.on("student-left", ({ username }) =>
      participantHandler(username, "left")
    );

    s.on("leave-success", leaveSuccessHandler);

    return () => {
      clearTimeout(timeout);
      s.off("lobby-updated", lobbyUpdatedHandler);
      s.off("join-success", joinSuccessHandler);
      s.off("chat-history", chatHistoryHandler);
      s.off("chat-message", chatMessageHandler);
      s.off("leave-success", leaveSuccessHandler);
      s.off("student-joined", studentJoinedHandler);
      s.off("student-left");
      s.off("quiz-started");
      s.off("quiz-ended");
      s.off("lobby-deleted");
      s.off("bank-updated");
    };
  }, [router.isReady, lobbyIdStr]);

  useEffect(() => {
    if (lobby?.status == "FINISHED") {
      setShowResultDialog(true);
    }
  }, [lobby?.status]);

  const sendMessage = () => {
    if (!chatInput.trim() || !lobbyId || !socket) return;
    socket.emit("chat-message", {
      lobbyId,
      userId,
      username: Cookies.get("user.username") || "Anonymous",
      message: chatInput,
    });
    setChatInput("");
  };

  const startQuiz = (lobbyId: string) => {
    const s = getSocket();
    if (s) s.emit("start-quiz", { lobbyId });

    showNotif({
      title: "Started!",
      description: "Quiz started successfully!",
    });
  };

  const endQuiz = (lobbyId: string) => {
    const s = getSocket();
    if (s) s.emit("end-quiz", { lobbyId });
  };

  const deleteLobby = (lobbyId: string) => {
    const s = getSocket();
    if (s) {
      s.emit("delete-lobby", { lobbyId, userId: Cookies.get("user.id") || "" });
    }

    showNotif({
      title: "Deleted!",
      description: "Lobby deleted successfully!",
    });
  };

  const leaveLobby = () => {
    if (!socket || !lobbyId) return;
    socket.emit("leave-lobby", {
      lobbyId,
      userId,
      username: Cookies.get("user.username") || "Anonymous",
    });

    showNotif({
      title: "Left!",
      description: "Left the lobby successfully!",
    });
  };

  const updateLobbyBank = (lobbyId: string, bankId: number) => {
    const s = getSocket();
    if (s) {
      s.emit("update-lobby-bank", { lobbyId, bankId });
    }
  };

  if (isLoading)
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center"
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <motion.div
            className="relative mb-8"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            <Radar className="w-24 h-24 text-blue-400 mx-auto opacity-60" />
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Plane className="w-12 h-12 text-blue-600" />
            </motion.div>
          </motion.div>
          <motion.h3
            className="text-2xl font-bold text-gray-800 mb-2"
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Loading Mission Status...
          </motion.h3>
          <motion.p
            className="text-blue-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Verifying mission parameters
          </motion.p>
        </div>
      </motion.div>
    );

  return (
    <LobbyHeader padded={false} backHref="/lobby/instructor" withBack>
      <InstructorLobbyContainer
        subjects={subjects || []}
        lobby={lobby as LobbyData}
        messages={messages}
        userId={userId}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendMessage={sendMessage}
        startQuiz={startQuiz}
        endQuiz={endQuiz}
        deleteLobby={deleteLobby}
        leaveLobby={leaveLobby}
        isSubjectLoading={isLoadingSubject}
        updateLobbyBank={updateLobbyBank}
      />

      {/* TODO: refactor this */}
      <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <AlertDialogContent asChild>
          <motion.div
            className="bg-white shadow-2xl border border-gray-200 rounded-3xl p-8 text-gray-900 lg:max-w-6xl overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Header */}
            <AlertDialogHeader className="flex flex-col justify-center items-center">
              <motion.div
                className="p-6 bg-blue-600 rounded-full mb-4 shadow-md"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
              <AlertDialogTitle className="text-4xl font-bold text-gray-800 text-center">
                Quiz Completed!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 text-lg text-center mt-2">
                Quiz has ended. Here are the results:
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Body */}
            <motion.div
              className="py-6 space-y-6 grid grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Overview */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-xl mb-4 text-blue-700 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Overview
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Total Participants</p>
                    <p className="text-3xl font-bold text-blue-600">100</p>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-xl mb-4 text-green-700 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  Top Performers
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Student
                    </span>
                    <span className="font-bold text-green-600">100 pts</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 shadow-sm col-span-2">
                <h3 className="font-semibold text-xl mb-4 text-purple-700 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Statistics
                </h3>
                <div>
                  <p className="text-gray-600 text-sm">Quiz Duration</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {lobby?.duration ? `${lobby.duration} min` : "N/A"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <AlertDialogFooter className="flex justify-end gap-4 mt-6">
              <ButtonQuiz
                onClick={() => setShowResultDialog(false)}
                variant="abort"
              >
                Close
              </ButtonQuiz>

              <ButtonQuiz
                onClick={() => {
                  setShowResultDialog(false);
                }}
                variant="softPrimary"
              >
                Return to Lobby
              </ButtonQuiz>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </LobbyHeader>
  );
}
