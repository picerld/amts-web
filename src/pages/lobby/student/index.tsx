"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getSocket } from "@/utils/socket";
import { LobbyData } from "@/types/lobby";

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

    // 🔹 Lobby events
    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      setLobbies(updatedLobbies.filter((l) => l.status === "WAITING"));
      setIsLoading(false);
    };

    const lobbyCreatedHandler = (newLobby: LobbyData) => {
      setLobbies((prev) => [...prev, newLobby]);
      showNotification(`New lobby "${newLobby.name}" is available!`);
    };

    const joinSuccessHandler = ({ lobbyId, lobbyName }: any) => {
      setJoinedLobby(lobbyId);
      setIsJoining(null);
      localStorage.setItem("joinedLobby", lobbyId);
      s.emit("get-chats", lobbyId);
      showNotification(`Successfully joined "${lobbyName}"!`);
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
      showNotification("Left the lobby successfully");
    };

    const lobbyDeletedHandler = ({ lobbyId }: any) => {
      setLobbies((prev) => prev.filter((lobby) => lobby.id !== lobbyId));
      if (localStorage.getItem("joinedLobby") === lobbyId) {
        setJoinedLobby(null);
        setCurrentQuiz(null);
        setMessages([]);
        showNotification("The lobby has been deleted by the instructor");
        localStorage.removeItem("joinedLobby");
      }
    };

    // 🔹 Chat events
    const chatHistoryHandler = (msgs: ChatMessage[]) => setMessages(msgs);
    const chatMessageHandler = (msg: ChatMessage) =>
      setMessages((prev) => [...prev, msg]);

    // 🔹 System messages for joins/leaves
    const studentJoinedHandler = ({ username }: any) => {
      const sysMsg: ChatMessage = {
        userId: "system",
        username: "System",
        message: `${username} joined the lobby.`,
        timestamp: new Date().toISOString(),
        type: "system",
        color: "green",
      };
      setMessages((prev) => [...prev, sysMsg]);
    };

    const studentLeftHandler = ({ userId: leavingUserId, username }: any) => {
      if (leavingUserId === userId) return; // <-- ignore own leave

      const sysMsg: ChatMessage = {
        userId: "system",
        username: "System",
        message: `${username} left the lobby.`,
        timestamp: new Date().toISOString(),
        type: "system",
        color: "red",
      };
      setMessages((prev) => [...prev, sysMsg]);
    };

    // 🔹 Quiz events
    const quizStartedHandler = (quizData: QuizData) => {
      if (localStorage.getItem("joinedLobby") === quizData.id) {
        setCurrentQuiz(quizData);
        showNotification(
          `Quiz "${quizData.name}" has started! Duration: ${quizData.duration} minutes`
        );
      }
    };

    const quizEndedHandler = ({ lobbyId }: any) => {
      if (localStorage.getItem("joinedLobby") === lobbyId) {
        setCurrentQuiz(null);
        setJoinedLobby(null);
        setMessages([]);
        showNotification("Quiz has ended. Thank you for participating!");
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

    // cleanup
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
    if (window.confirm("Are you sure you want to leave this lobby?")) {
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
    showNotification("Refreshing lobbies...");
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

  // 🔹 Quiz UI
  if (currentQuiz) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-green-800">
            {currentQuiz.name}
          </h1>
          <p className="text-green-600 mb-4">Quiz is now active!</p>
          <p className="text-green-800 font-semibold">
            Duration: {currentQuiz.duration} min
          </p>
        </div>
      </div>
    );
  }

  // 🔹 Loading UI
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="text-gray-400 text-8xl mb-6">📚</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Loading lobbies...
        </h3>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {notification && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <p className="text-blue-800">{notification}</p>
          <button
            onClick={dismissNotification}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLeaving && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center">
          Leaving lobby...
        </div>
      )}

      {/* Lobbies Section */}
      {lobbies.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-8xl mb-6">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No active lobbies
          </h3>
          <p className="text-gray-500 mb-6">
            Wait for your teacher to create a quiz lobby
          </p>
          <button
            onClick={refreshLobbies}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Check Again
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lobbies.map((lobby) => (
            <div
              key={lobby.id}
              className="bg-white border rounded-xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">
                    {lobby.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    by {lobby.instructor?.username || "Unknown"}
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                  {lobby.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium text-gray-800">
                    {lobby.duration} min
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Students:</span>
                  <span className="font-medium text-blue-600">
                    {lobby._count?.LobbyUser || 0}
                  </span>
                </div>
              </div>

              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  joinedLobby === lobby.id
                    ? "bg-green-100 text-green-800 cursor-default ring-2 ring-green-300"
                    : isJoining === lobby.id
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : joinedLobby
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md transform hover:-translate-y-0.5"
                }`}
                onClick={() => joinLobby(lobby.id)}
                disabled={!!joinedLobby || isJoining === lobby.id}
              >
                {joinedLobby === lobby.id
                  ? "Joined - Waiting for quiz"
                  : isJoining === lobby.id
                  ? "Joining..."
                  : joinedLobby
                  ? "Already in another lobby"
                  : "Join Lobby"}
              </button>
            </div>
          ))}
        </div>
      )}

      {joinedLobby && (
        <div className="mt-10 bg-white border rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Lobby Chat</h2>
            <button
              onClick={leaveLobby}
              className="text-red-500 hover:text-red-700 text-sm underline"
            >
              Leave Lobby
            </button>
          </div>

          <div className="flex-1 overflow-y-auto border p-2 rounded bg-gray-50 h-64 mb-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-1 text-sm ${
                  msg.type === "system"
                    ? msg.color === "red"
                      ? "text-red-500 italic"
                      : "text-green-500 italic"
                    : "text-gray-800"
                }`}
              >
                {msg.type === "system" ? (
                  <>
                    <span>{msg.message}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-blue-600">
                      {msg.username}
                    </span>
                    <span>: {msg.message}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
