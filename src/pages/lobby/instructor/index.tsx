"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/utils/socket";
import Cookies from "js-cookie";
import { LobbyData } from "@/types/lobby";

export default function TeacherPage() {
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [lobbyName, setLobbyName] = useState("");

  const instructorId =
    Cookies.get("user.id") ?? "teacher-" + Math.floor(Math.random() * 1000);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.emit("get-lobbies");

    s.on("lobby-updated", (updatedLobbies: LobbyData[]) => {
      const myLobbies = updatedLobbies.filter(
        (l) => l.instructorId === instructorId
      );
      setLobbies(myLobbies);
    });

    s.on("quiz-started", (startedLobby: LobbyData) => {
      if (startedLobby.instructorId === instructorId) {
        setLobbies((prev) =>
          prev.map((l) =>
            l.id === startedLobby.id ? { ...l, status: "ONGOING" } : l
          )
        );
      }
    });

    s.on("lobby-deleted", ({ lobbyId }) => {
      setLobbies((prev) => prev.filter((l) => l.id !== lobbyId));
    });

    s.on("lobby-created", (createdLobby: LobbyData) => {
      if (createdLobby.instructorId === instructorId) {
        setLobbies((prev) => [...prev, createdLobby]);
      }
    });

    return () => {
      s.off("lobby-updated");
      s.off("quiz-started");
      s.off("lobby-deleted");
      s.off("lobby-created");
    };
  }, [instructorId]);

  const createLobby = () => {
    if (!socket || !lobbyName.trim()) return;
    setIsCreating(true);

    socket.emit("create-lobby", {
      name: lobbyName,
      instructorId,
      duration: 30,
    });

    setLobbyName("");
    setIsCreating(false);
  };

  const startQuiz = (lobbyId: string) => {
    if (!socket) return;
    socket.emit("start-quiz", { lobbyId });
  };

  const deleteLobby = (lobbyId: string) => {
    if (!socket) return;
    if (confirm("Are you sure you want to delete this lobby?")) {
      socket.emit("delete-lobby", { lobbyId, instructorId });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="font-bold text-2xl mb-6">Teacher Dashboard</h1>

      {/* Create Lobby Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create a New Quiz Lobby</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Enter lobby name"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            className="border px-4 py-2 rounded-lg flex-1"
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            onClick={createLobby}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Lobbies List */}
      {lobbies.length === 0 ? (
        <p className="text-gray-500 text-center">No lobbies yet.</p>
      ) : (
        <div className="grid gap-4">
          {lobbies.map((lobby) => (
            <div
              key={lobby.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-lg font-semibold">{lobby.name}</h2>
              <p className="text-sm text-gray-500 mb-2">Lobby ID: {lobby.id}</p>
              <p className="text-sm text-gray-500 mb-4">
                Students Joined: {lobby._count?.LobbyUser || 0}
              </p>

              {lobby.status === "WAITING" && (
                <div className="space-x-3">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                    onClick={() => startQuiz(lobby.id)}
                  >
                    Start Quiz
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                    onClick={() => deleteLobby(lobby.id)}
                  >
                    Delete
                  </button>
                </div>
              )}

              {lobby.status === "ONGOING" && (
                <p className="text-green-700 font-semibold mt-2">
                  Quiz is active!
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
