"use client";

import { useEffect, useState } from "react";
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
  RefreshCw,
  User,
  Star,
  Trophy,
  Radar
} from "lucide-react";

type QuizData = {
  id: string;
  name: string;
  duration: number;
};

type ChatMessage = {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type?: "chat" | "system";
  color?: "red" | "green";
};

export default function StudentPage() {
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [joinedLobby, setJoinedLobby] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [notification, setNotification] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<any | null>(null);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    const id =
      Cookies.get("user.id") ?? "student-" + Math.floor(Math.random() * 1000);
    setUserId(id);
    const username = Cookies.get("user.username") || "Anonymous";

    const s = getSocket();
    setSocket(s);

    // Restore joined lobby if saved
    const savedLobby = localStorage.getItem("joinedLobby");
    if (savedLobby) {
      s.emit("join-lobby", { lobbyId: savedLobby, userId: id, username });
    }

    s.emit("get-lobbies");

    // Event handlers
    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      setLobbies(updatedLobbies.filter((l) => l.status === "WAITING"));
      setIsLoading(false);
    };

    const lobbyCreatedHandler = (newLobby: LobbyData) => {
      setLobbies((prev) => [...prev, newLobby]);
      showNotification(`New mission "${newLobby.name}" is available!`);
    };

    const joinSuccessHandler = ({ lobbyId, lobbyName }: any) => {
      setJoinedLobby(lobbyId);
      setIsJoining(null);
      localStorage.setItem("joinedLobby", lobbyId);
      s.emit("get-chats", lobbyId);
      showNotification(`Successfully joined mission "${lobbyName}"!`);
    };

    const joinErrorHandler = ({ message }: any) => {
      console.error("Join error:", message);
      setIsJoining(null);
      showNotification(message);
    };

    const leaveSuccessHandler = ({ lobbyId }: any) => {
      setJoinedLobby(null);
      setCurrentQuiz(null);
      setMessages([]);
      localStorage.removeItem("joinedLobby");
      setIsLeaving(false);
      showNotification("Left the mission successfully");
    };

    const lobbyDeletedHandler = ({ lobbyId }: any) => {
      setLobbies((prev) => prev.filter((lobby) => lobby.id !== lobbyId));
      if (localStorage.getItem("joinedLobby") === lobbyId) {
        setJoinedLobby(null);
        setCurrentQuiz(null);
        setMessages([]);
        showNotification("The mission has been cancelled by command");
        localStorage.removeItem("joinedLobby");
      }
    };

    const chatHistoryHandler = (msgs: ChatMessage[]) => setMessages(msgs);
    const chatMessageHandler = (msg: ChatMessage) =>
      setMessages((prev) => [...prev, msg]);

    const studentJoinedHandler = ({ username }: any) => {
      const sysMsg: ChatMessage = {
        userId: "system",
        username: "Command",
        message: `${username} has joined the mission.`,
        timestamp: new Date().toISOString(),
        type: "system",
        color: "green",
      };
      setMessages((prev) => [...prev, sysMsg]);
    };

    const studentLeftHandler = ({ userId: leavingUserId, username }: any) => {
      if (leavingUserId === userId) return;

      const sysMsg: ChatMessage = {
        userId: "system",
        username: "Command",
        message: `${username} has left the mission.`,
        timestamp: new Date().toISOString(),
        type: "system",
        color: "red",
      };
      setMessages((prev) => [...prev, sysMsg]);
    };

    const quizStartedHandler = (quizData: QuizData) => {
      if (localStorage.getItem("joinedLobby") === quizData.id) {
        setCurrentQuiz(quizData);
        showNotification(
          `Mission "${quizData.name}" has started! Duration: ${quizData.duration} minutes`
        );
      }
    };

    const quizEndedHandler = ({ lobbyId }: any) => {
      if (localStorage.getItem("joinedLobby") === lobbyId) {
        setCurrentQuiz(null);
        setJoinedLobby(null);
        setMessages([]);
        showNotification("Mission completed. Thank you for your service!");
        localStorage.removeItem("joinedLobby");
      }
    };

    // Attach listeners
    s.on("lobby-updated", lobbyUpdatedHandler);
    s.on("lobby-created", lobbyCreatedHandler);
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

    return () => {
      s.off("lobby-updated", lobbyUpdatedHandler);
      s.off("lobby-created", lobbyCreatedHandler);
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
  }, []);

  const showNotification = (msg: string) => setNotification(msg);
  const dismissNotification = () => setNotification("");

  const joinLobby = (lobbyId: string) => {
    if (!socket || isJoining || joinedLobby) return;
    setIsJoining(lobbyId);
    socket.emit("join-lobby", {
      lobbyId,
      userId,
      username: Cookies.get("user.username") || "Anonymous",
    });
  };

  const leaveLobby = () => {
    if (!socket || !joinedLobby) return;
    if (window.confirm("Are you sure you want to abort this mission?")) {
      socket.emit("leave-lobby", {
        lobbyId: joinedLobby,
        userId,
        username: Cookies.get("user.username") || "Anonymous",
      });
      setIsLeaving(true);
    }
  };

  const refreshLobbies = () => {
    if (!socket) return;
    setIsLoading(true);
    socket.emit("get-lobbies");
    showNotification("Scanning for new missions...");

    setTimeout(() => {
      setIsLoading(false);
      dismissNotification();
    }, 3000);
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !joinedLobby || !socket) return;

    socket.emit("chat-message", {
      lobbyId: joinedLobby,
      userId,
      username: Cookies.get("user.username") || "Anonymous",
      message: chatInput,
    });

    setChatInput("");
  };

  // Quiz Active UI
  if (currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 text-center max-w-2xl mx-6 shadow-2xl">
            <div className="mb-8">
              <div className="p-6 bg-green-500 rounded-full w-24 h-24 mx-auto mb-6">
                <Trophy className="w-12 h-12 text-white mx-auto" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {currentQuiz.name}
              </h1>
              <div className="flex items-center justify-center gap-2 text-green-200 mb-6">
                <Target className="w-5 h-5" />
                <span className="text-xl">Mission Active</span>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 text-white">
                <Clock className="w-6 h-6" />
                <span className="text-2xl font-bold">{currentQuiz.duration} Minutes</span>
              </div>
              <p className="text-green-200 mt-2">Mission Duration</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-green-300">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>Training in progress...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <Radar className="w-24 h-24 text-blue-300 mx-auto animate-spin opacity-60" />
            <Plane className="w-12 h-12 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Scanning for Missions...
          </h3>
          <p className="text-blue-200">Establishing connection with command center</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-600 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">TNI AU Training Center</h1>
                <p className="text-blue-200">Cadet Mission Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Notifications */}
          {notification && (
            <div className="mb-6 bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-white font-medium">{notification}</p>
                </div>
                <button
                  onClick={dismissNotification}
                  className="text-blue-200 hover:text-white text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {isLeaving && (
            <div className="mb-6 bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-yellow-200">
                <div className="w-5 h-5 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin"></div>
                <span>Aborting mission...</span>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Missions Section */}
            <div className="lg:col-span-3">
              {lobbies.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mb-8">
                    <Radar className="w-24 h-24 text-blue-300 mx-auto mb-6 opacity-50" />
                    <h3 className="text-2xl font-bold text-white mb-2">No Active Missions</h3>
                    <p className="text-blue-200 mb-6">
                      Waiting for command to deploy training missions
                    </p>
                    <button
                      onClick={refreshLobbies}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Scan Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Target className="w-6 h-6 text-blue-300" />
                      Available Missions
                    </h2>
                    <button
                      onClick={refreshLobbies}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                  
                  <div className="grid gap-6">
                    {lobbies.map((lobby) => (
                      <div
                        key={lobby.id}
                        className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        {/* Mission Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-full border border-blue-400/30">
                              <Plane className="w-6 h-6 text-blue-300" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                                {lobby.name}
                              </h3>
                              <p className="text-blue-300 text-sm">
                                Commander: {lobby.instructor?.username || "Unknown"}
                              </p>
                              <p className="text-blue-400 text-xs">
                                Mission ID: {lobby.id.slice(-8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-semibold">
                            STANDBY
                          </div>
                        </div>

                        {/* Mission Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-blue-200 mb-2">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">Cadets</span>
                            </div>
                            <span className="text-2xl font-bold text-white">
                              {lobby._count?.LobbyUser || 0}
                            </span>
                          </div>
                          
                          <div className="bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-blue-200 mb-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">Duration</span>
                            </div>
                            <span className="text-2xl font-bold text-white">
                              {lobby.duration}m
                            </span>
                          </div>
                        </div>

                        {/* Mission Brief */}
                        <div className="bg-white/5 rounded-xl p-4 mb-6">
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            Mission Briefing
                          </h4>
                          <p className="text-blue-200 text-sm">
                            Training exercise designed to test tactical knowledge and decision-making skills under pressure.
                          </p>
                        </div>

                        {/* Action Button */}
                        <button
                          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                            joinedLobby === lobby.id
                              ? "bg-green-500/20 text-green-300 border border-green-500/30 cursor-default"
                              : isJoining === lobby.id
                              ? "bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed"
                              : joinedLobby
                              ? "bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                          }`}
                          onClick={() => joinLobby(lobby.id)}
                          disabled={!!joinedLobby || isJoining === lobby.id}
                        >
                          {joinedLobby === lobby.id ? (
                            <>
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              Enlisted - Awaiting Orders
                            </>
                          ) : isJoining === lobby.id ? (
                            <>
                              <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                              Enlisting...
                            </>
                          ) : joinedLobby ? (
                            <>
                              <Shield className="w-5 h-5" />
                              Already on Mission
                            </>
                          ) : (
                            <>
                              <Target className="w-5 h-5" />
                              Enlist for Mission
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Communication Panel */}
            {joinedLobby && (
              <div className="lg:col-span-3">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-blue-600/30 border-b border-white/20 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Mission Comms</h3>
                          <p className="text-blue-200 text-sm">Secure Channel</p>
                        </div>
                      </div>
                      <button
                        onClick={leaveLobby}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Abort
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="h-80 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`${
                          msg.type === "system"
                            ? "text-center"
                            : msg.userId === userId
                            ? "ml-4"
                            : "mr-4"
                        }`}
                      >
                        {msg.type === "system" ? (
                          <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                            <span className={`text-xs font-medium ${
                              msg.color === "red" ? "text-red-300" : "text-green-300"
                            }`}>
                              {msg.message}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <div className={`max-w-xs ${
                            msg.userId === userId 
                              ? "ml-auto bg-blue-500/20 border border-blue-400/30" 
                              : "bg-white/10 border border-white/20"
                          } rounded-xl p-3`}>
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-3 h-3 text-blue-300" />
                              <span className="text-xs font-semibold text-blue-200">
                                {msg.username}
                              </span>
                            </div>
                            <p className="text-sm text-white">{msg.message}</p>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-white/20 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Send message to team..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}