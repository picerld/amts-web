"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { getSocket } from "@/utils/socket";
import { LobbyData } from "@/types/lobby";
import {
  Plane,
  Users,
  Clock,
  Shield,
  Target,
  MessageSquare,
  Send,
  LogOut,
  User,
  ArrowLeft,
  Radar,
} from "lucide-react";

type ChatMessage = {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type?: "chat" | "system";
  color?: "red" | "green";
};

export default function StudentLobbyChat() {
  const router = useRouter();
  const { lobbyId } = router.query;

  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [notification, setNotification] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<any | null>(null);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (!router.isReady || !lobbyId || typeof lobbyId !== "string") return;

    // Generate or get userId
    const id =
      Cookies.get("user.id") ?? "student-" + Math.floor(Math.random() * 1000);
    setUserId(id);
    const username = Cookies.get("user.username") || "Anonymous";

    const s = getSocket();
    setSocket(s);

    // Verify lobby from localStorage
    const savedLobby = localStorage.getItem("joinedLobby");
    if (savedLobby !== lobbyId) {
      router.push("/lobby/student");
      return;
    }

    // ===== Emit join events =====
    s.emit("join-lobby", { lobbyId, userId: id, username });
    s.emit("get-chats", lobbyId);
    s.emit("get-lobbies");

    // ===== Handlers =====
    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      const currentLobby = updatedLobbies.find((l) => l.id === lobbyId);
      if (currentLobby) setLobby(currentLobby);
      setIsLoading(false);
    };

    const joinSuccessHandler = ({ lobbyId: joinedLobbyId, lobbyName }: any) => {
      if (joinedLobbyId === lobbyId) {
        showNotification(`Connected to mission "${lobbyName}"`);
      }
    };

    const joinErrorHandler = ({ message }: any) => {
      console.error("Join error:", message);
      showNotification(message);
      router.push("/lobby/student");
    };

    const leaveSuccessHandler = ({ lobbyId: leftLobbyId }: any) => {
      if (leftLobbyId === lobbyId) {
        localStorage.removeItem("joinedLobby");
        setIsLeaving(false);
        showNotification("Left the mission successfully");
        router.push("/lobby/student");
      }
    };

    const lobbyDeletedHandler = ({ lobbyId: deletedLobbyId }: any) => {
      if (deletedLobbyId === lobbyId) {
        localStorage.removeItem("joinedLobby");
        showNotification("The mission has been cancelled by command");
        router.push("/lobby/student");
      }
    };

    const chatHistoryHandler = (msgs: ChatMessage[]) => {
      // Filter system messages for self to prevent duplicates
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

    const studentLeftHandler = ({
      userId: leavingUserId,
      username: leftUsername,
    }: any) => {
      if (leavingUserId === userId) return; // Skip if this client left
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

    const quizStartedHandler = (updatedLobby: any) => {
      if (updatedLobby.id === lobbyId) {
        showNotification(`Mission "${updatedLobby.name}" has started!`);
        router.push(`/lobby/student/${lobbyId}/start`);
      }
    };

    const quizEndedHandler = ({ lobbyId: endedLobbyId }: any) => {
      if (endedLobbyId === lobbyId) {
        localStorage.removeItem("joinedLobby");
        showNotification("Mission completed. Thank you for your service!");
        router.push("/lobby/student");
      }
    };

    // ===== Attach listeners =====
    s.on("lobby-updated", lobbyUpdatedHandler);
    s.on("join-success", joinSuccessHandler);
    s.on("join-error", joinErrorHandler);
    s.on("leave-success", leaveSuccessHandler);
    s.on("lobby-deleted", lobbyDeletedHandler);
    s.on("chat-history", chatHistoryHandler);
    s.on("chat-message", chatMessageHandler);
    s.on("student-joined", studentJoinedHandler);
    s.on("student-left", studentLeftHandler);
    s.on("quiz-started", quizStartedHandler);
    s.on("quiz-ended", quizEndedHandler);

    // ===== Cleanup on unmount =====
    return () => {
      s.off("lobby-updated", lobbyUpdatedHandler);
      s.off("join-success", joinSuccessHandler);
      s.off("join-error", joinErrorHandler);
      s.off("leave-success", leaveSuccessHandler);
      s.off("lobby-deleted", lobbyDeletedHandler);
      s.off("chat-history", chatHistoryHandler);
      s.off("chat-message", chatMessageHandler);
      s.off("student-joined", studentJoinedHandler);
      s.off("student-left", studentLeftHandler);
      s.off("quiz-started", quizStartedHandler);
      s.off("quiz-ended", quizEndedHandler);
    };
  }, [router.isReady, lobbyId]);

  // ===== Helpers =====
  const showNotification = (msg: string) => setNotification(msg);
  const dismissNotification = () => setNotification("");

  const leaveLobby = () => {
    if (!socket || !lobbyId) return;
    if (window.confirm("Are you sure you want to abort this mission?")) {
      socket.emit("leave-lobby", {
        lobbyId,
        userId,
        username: Cookies.get("user.username") || "Anonymous",
      });
      setIsLeaving(true);
    }
  };

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

  const goBackToLobbyList = () => {
    router.push("/lobby/student");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const messageVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  // Loading UI - Show while router is not ready or lobby data is loading
  if (!router.isReady || isLoading || !lobby) {
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
            Connecting to Mission...
          </motion.h3>
          <motion.p
            className="text-blue-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Establishing secure communication
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="relative overflow-hidden bg-white shadow-lg"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent"></div>
        <div className="relative px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-4"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  onClick={goBackToLobbyList}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 border border-blue-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <motion.div
                  className="p-3 bg-main rounded-full shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {lobby.name}
                  </h1>
                  <p className="text-blue-600 font-medium">
                    Commander: {lobby.instructor?.username || "Unknown"}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
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
          </div>
        </div>
      </motion.div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Notifications */}
          <AnimatePresence>
            {notification && (
              <motion.div
                className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-md"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-2 bg-main rounded-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <MessageSquare className="w-4 h-4 text-white" />
                    </motion.div>
                    <p className="text-gray-800 font-medium">{notification}</p>
                  </div>
                  <motion.button
                    onClick={dismissNotification}
                    className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Dismiss
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isLeaving && (
              <motion.div
                className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 text-yellow-700">
                  <motion.div
                    className="w-5 h-5 border-2 border-yellow-400 border-t-yellow-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  />
                  <span className="font-medium">Aborting mission...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Mission Info */}
            <motion.div className="lg:col-span-1" variants={containerVariants}>
              <motion.div
                className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl"
                variants={itemVariants}
              >
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
                      <span className="text-sm font-medium">Active Cadets</span>
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

                <motion.button
                  onClick={leaveLobby}
                  className="w-full mt-6 py-3 px-4 bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-700 hover:text-red-800 rounded-xl font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLeaving}
                >
                  <LogOut className="w-4 h-4" />
                  {isLeaving ? "Aborting..." : "Abort Mission"}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Communication Panel */}
            <motion.div className="lg:col-span-2" variants={containerVariants}>
              <motion.div
                className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col"
                variants={itemVariants}
              >
                {/* Chat Header */}
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-200 p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-2 bg-white/20 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                    >
                      <MessageSquare className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Mission Communications
                      </h3>
                      <p className="text-blue-100 text-sm">
                        Secure Channel - End-to-End Encrypted
                      </p>
                    </div>
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
                          variants={messageVariants}
                          initial="hidden"
                          animate="visible"
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
                  <div className="flex gap-3">
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
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --bg-main: #2563eb;
        }
        .bg-main {
          background-color: var(--bg-main);
        }
        .border-main {
          border-color: var(--bg-main);
        }
        .text-main {
          color: var(--bg-main);
        }
      `}</style>
    </motion.div>
  );
}
