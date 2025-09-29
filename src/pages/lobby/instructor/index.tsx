"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/utils/socket";
import Cookies from "js-cookie";
import { LobbyData } from "@/types/lobby";
import LobbyHeader from "@/features/lobby/components/LobbyHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Users,
  Clock,
  Star,
  Shield,
  Target,
  CheckCircle,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
  hover: { scale: 1.02 },
};

export default function TeacherPage() {
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [lobbyName, setLobbyName] = useState("");
  const [lobbyDuration, setLobbyDuration] = useState(0);

  const instructorId =
    Cookies.get("user.id") ?? "teacher-" + Math.floor(Math.random() * 1000);

  useEffect(() => {
    const s = getSocket();

    s.emit("get-lobbies");

    s.on("lobby-updated", (updatedLobbies: LobbyData[]) => {
      setLobbies(updatedLobbies.filter((l) => l.instructorId === instructorId));
    });

    s.on("quiz-started", (startedLobby: LobbyData) => {
      console.log("Quiz started event received for", startedLobby.id);
      if (startedLobby.instructorId === instructorId) {
        setLobbies((prev) =>
          prev.map((l) =>
            l.id === startedLobby.id ? { ...l, status: "ONGOING" } : l
          )
        );
      }
    });

    s.on("quiz-ended", ({ lobbyId }) => {
      console.log("Quiz ended event received for", lobbyId);
      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.id === lobbyId ? { ...lobby, status: "FINISHED" } : lobby
        )
      );
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
      s.off("quiz-ended");
      s.off("lobby-deleted");
      s.off("lobby-created");
    };
  }, [instructorId]);

  const createLobby = () => {
    const s = getSocket();
    if (!s || !lobbyName.trim()) return;

    setIsCreating(true);

    s.emit("create-lobby", {
      name: lobbyName,
      instructorId,
      duration: lobbyDuration,
    });

    setLobbyName("");
    setLobbyDuration(0);
    setIsCreating(false);
  };

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
    if (s && confirm("Delete this mission briefing?")) {
      s.emit("delete-lobby", { lobbyId, instructorId });
    }
  };

  const sortedLobbies = [...lobbies].sort((a, b) => {
    const order = { WAITING: 1, ONGOING: 2, FINISHED: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <LobbyHeader>
      {/* Create Lobby Form */}
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-bold mb-4">
          Create a New Mission Briefing
        </h2>
        <div className="flex flex-col md:flex-row gap-3">
          <motion.input
            type="text"
            placeholder="Mission name"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            className="border px-4 py-2 rounded-lg flex-1"
            whileFocus={{ scale: 1.02 }}
          />
          <motion.input
            type="number"
            placeholder="Duration (minutes)"
            value={lobbyDuration || ""}
            onChange={(e) => setLobbyDuration(parseInt(e.target.value))}
            className="border px-4 py-2 rounded-lg flex-1"
            whileFocus={{ scale: 1.02 }}
          />
          <motion.button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            onClick={createLobby}
            disabled={isCreating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCreating ? "Deploying..." : "Deploy Mission"}
          </motion.button>
        </div>
      </motion.div>

      {/* Lobbies List */}
      <AnimatePresence mode="wait">
        {lobbies.length === 0 ? (
          <motion.p
            key="no-lobbies"
            className="text-gray-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            No missions deployed yet.
          </motion.p>
        ) : (
          <motion.div
            className="grid gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {sortedLobbies.map((lobby, index) => (
              <motion.div
                key={lobby.id}
                className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl"
                variants={cardVariants}
                whileHover="hover"
                layout
                custom={index}
              >
                {/* Mission Header */}
                <motion.div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="p-3 bg-blue-50 rounded-full border-2 border-blue-200"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Plane className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {lobby.name}
                      </h3>
                      <p className="text-blue-600 text-sm font-medium">
                        Commander: You
                      </p>
                      <p className="text-gray-500 text-xs">
                        Mission ID: {lobby.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      lobby.status === "WAITING"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                        : lobby.status === "ONGOING"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-200 text-gray-600 border border-gray-300"
                    }`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {lobby.status}
                  </motion.div>
                </motion.div>

                {/* Mission Stats */}
                <motion.div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div
                    className="bg-blue-50 border border-blue-100 rounded-xl p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Cadets</span>
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
                </motion.div>

                {/* Mission Brief */}
                <motion.div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                  <h4 className="text-gray-800 font-semibold mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Mission Briefing
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Tactical training exercise to prepare cadets for live
                    operations.
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {lobby.status === "WAITING" && (
                    <>
                      <motion.button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                        onClick={() => startQuiz(lobby.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Target className="w-5 h-5" /> Start Mission
                      </motion.button>
                      <motion.button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                        onClick={() => deleteLobby(lobby.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Shield className="w-5 h-5" /> Abort
                      </motion.button>
                    </>
                  )}

                  {lobby.status === "ONGOING" && (
                    <motion.button
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                      onClick={() => endQuiz(lobby.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Target className="w-5 h-5" /> End Mission
                    </motion.button>
                  )}

                  {lobby.status === "FINISHED" && (
                    <>
                      <motion.div className="flex-1 bg-green-100 text-green-700 border-green-300 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-inner">
                        <CheckCircle className="w-5 h-5" /> Mission Completed
                      </motion.div>
                      <motion.button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                        onClick={() => deleteLobby(lobby.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Shield className="w-5 h-5" /> Delete
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </LobbyHeader>
  );
}
