"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getSocket } from "@/utils/socket";
import { LobbyData } from "@/types/lobby";
import LobbyHeader from "@/features/quizz/components/container/LobbyHeader";
import { useNotification } from "@/features/quizz/context/NotificationContext";
import { containerVariants } from "@/features/quizz/lobby/instructor/components/InstructorLobbyList";
import {
  BookmarkCheck,
  CheckCircle,
  Clock,
  LogOut,
  MessageSquare,
  Shield,
  Target,
  User,
  Users,
} from "lucide-react";
import { ButtonQuiz } from "@/features/quizz/components/ui/button-quiz";
import { QuizConfirmDialog } from "@/features/quizz/components/container/QuizConfirmDialog";

type ChatMessage = {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type?: "chat" | "system";
  color?: "red" | "green";
};

export default function InstructorLobbyRoom() {
  const router = useRouter();
  const { lobbyId } = router.query;

  const { showNotif } = useNotification();

  const [socket, setSocket] = useState<any>(null);
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [loadingError, setLoadingError] = useState(false);

  const lobbyIdStr = Array.isArray(lobbyId) ? lobbyId[0] : lobbyId;

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
      console.log("Quiz started event received for", startedLobby.id);
      if (startedLobby.instructorId === id) {
        setLobby((prev) =>
          prev?.id === startedLobby.id ? { ...prev, status: "ONGOING" } : prev
        );
      }
    });

    s.on("quiz-ended", ({ lobbyId }) => {
      setLobby((prev) =>
        prev?.id === lobbyId ? { ...prev, status: "FINISHED" } : prev
      );
    });

    s.on("lobby-deleted", ({ lobbyId }) => {
      if (lobbyId === lobbyIdStr) {
        router.push("/lobby/instructor");
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
      if (joinedId === userId) return; // ignore your own join
      // Only add message if it doesn't already exist
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
      s.on("student-joined", studentJoinedHandler);
      s.off("student-left");
      s.off("quiz-started");
      s.off("quiz-ended");
      s.off("lobby-deleted");
    };
  }, [router.isReady, lobbyIdStr]);

  const startQuiz = (lobbyId: string) => {
    const s = getSocket();
    if (s) s.emit("start-quiz", { lobbyId });
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
    if (window.confirm("Are you sure you want to abort this mission?")) {
      socket.emit("leave-lobby", {
        lobbyId,
        userId,
        username: Cookies.get("user.username") || "Anonymous",
      });
    }
  };

  if (isLoading) return <div className="p-6">Loading lobby...</div>;
  if (loadingError || !lobby)
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">
          {loadingError
            ? "Failed to load lobby. Connection issue or lobby does not exist."
            : "Lobby not found."}
        </p>
        <button
          onClick={() => router.push("/instructor")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back
        </button>
      </div>
    );

  return (
    <LobbyHeader backHref="/lobby/instructor" withBack>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="flex flex-col gap-5">
          <motion.div
            className="lg:col-span-1"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-blue-600" />
                Pick Your Subject!
              </h3>
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-1"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Mission Details
              </h3>

              <div className="space-y-4">
                <motion.div
                  className="bg-blue-50 border border-blue-100 rounded-xl p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {lobby._count?.LobbyUser || 0}
                  </span>
                </motion.div>

                <motion.div
                  className="bg-blue-50 border border-blue-100 rounded-xl p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {lobby.duration}m
                  </span>
                </motion.div>

                <motion.div
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="text-gray-800 font-semibold mb-2">
                    Mission ID
                  </h4>
                  <p className="text-gray-600 text-sm font-mono">
                    {lobby.id.slice(-12).toUpperCase()}
                  </p>
                </motion.div>
              </div>

              {lobby.status == "WAITING" && (
                <>
                  <ButtonQuiz
                    variant={"start"}
                    onClick={() => startQuiz(lobby.id)}
                    className="w-full mt-5"
                  >
                    <Target className="w-5 h-5" /> Start Mission
                  </ButtonQuiz>

                  <ButtonQuiz
                    variant={"abort"}
                    onClick={leaveLobby}
                    className="w-full mt-5"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Lobby
                  </ButtonQuiz>
                </>
              )}

              {lobby.status == "ONGOING" && (
                <ButtonQuiz
                  variant={"softPrimary"}
                  onClick={() => endQuiz(lobby.id)}
                  className="w-full mt-5"
                >
                  <Target className="w-5 h-5" /> End Mission
                </ButtonQuiz>
              )}

              {lobby.status === "FINISHED" && (
                <div className="flex flex-col gap-5 mt-5">
                  <ButtonQuiz variant={"start"} disabled>
                    <CheckCircle className="w-5 h-5" /> Completed
                  </ButtonQuiz>

                  <QuizConfirmDialog
                    trigger={
                      <ButtonQuiz variant={"abort"}>
                        <Shield className="w-5 h-5" /> Delete
                      </ButtonQuiz>
                    }
                    title="Confirm Delete"
                    description="Are you sure you want to delete this lobby?"
                    confirmText="Yes, Delete!"
                    cancelText="No, Cancel!"
                    onConfirm={() => deleteLobby(lobby.id)}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="lg:col-span-2"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col">
            {/* Chat Header */}
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-200 p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between gap-3">
                <motion.div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 bg-white/20 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <MessageSquare className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Lobby Chats!
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Secure Channel - End-to-End Encrypted
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    lobby.status === "ONGOING"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : "bg-green-100 text-green-700 border border-green-300"
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {lobby.status}
                </motion.div>
              </div>
            </motion.div>

            {/* Messages */}
            <motion.div
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {messages.length === 0 ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-gray-600 font-semibold mb-2">
                    Communication Channel Open
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Waiting for mission communications...
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      className={`${
                        msg.type === "system"
                          ? "text-center"
                          : msg.userId === userId
                          ? "ml-4"
                          : "mr-4"
                      }`}
                      exit="hidden"
                      layout
                    >
                      {msg.type === "system" ? (
                        <motion.div
                          className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-sm"
                          whileHover={{ scale: 1.02 }}
                        >
                          <span
                            className={`text-sm font-medium ${
                              msg.color === "red"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {msg.message}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          className={`max-w-sm ${
                            msg.userId === userId
                              ? "ml-auto bg-main text-white border border-blue-600"
                              : "bg-white border border-gray-200 text-gray-800"
                          } rounded-xl p-4 shadow-md`}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-semibold opacity-80">
                              {msg.username}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">
                            {msg.message}
                          </p>
                          <div className="text-xs opacity-60 mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>

            {/* Message Input */}
            <motion.div
              className="border-t border-gray-200 p-6 bg-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* <div className="flex gap-3">
                <motion.input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Send encrypted message to team..."
                  className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.button
                  onClick={sendMessage}
                  className="bg-main hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                  Send
                </motion.button>
              </div> */}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </LobbyHeader>
  );
}
