"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { getSocket } from "@/utils/socket";
import { LobbyData } from "@/types/lobby";
import {
  Trophy,
  Target,
  Clock,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Radar,
  Plane,
} from "lucide-react";
import { useCountdown } from "../../hooks/useCountdown";

type QuizData = {
  id: string;
  name: string;
  duration: number;
};

export default function StudentQuizStart() {
  const router = useRouter();
  const { lobbyId } = router.query;

  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [notification, setNotification] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<any | null>(null);
  const [userId, setUserId] = useState<string>("");

  const { formattedTime, timeLeft, isExpired } = useCountdown(
    lobby?.duration || 0,
    lobby?.startTime?.toString() || undefined,
    lobby?.status === "ONGOING"
  );

  useEffect(() => {
    if (!router.isReady || !lobbyId) return;

    const id =
      Cookies.get("user.id") ?? "student-" + Math.floor(Math.random() * 1000);
    setUserId(id);
    const username = Cookies.get("user.username") || "Anonymous";

    const s = getSocket();
    setSocket(s);

    // Verify this is the correct lobby from localStorage
    const savedLobby = localStorage.getItem("joinedLobby");
    if (savedLobby !== lobbyId) {
      // Not the correct lobby, redirect to lobby list
      router.push("/lobby/student");
      return;
    }

    // Get initial lobby data
    s.emit("get-lobbies");

    // ===== Handlers =====
    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      const currentLobby = updatedLobbies.find((l) => l.id === lobbyId);
      if (currentLobby) {
        setLobby(currentLobby);

        // If quiz is ongoing, set quiz data
        if (currentLobby.status === "ONGOING") {
          setCurrentQuiz({
            id: currentLobby.id,
            name: currentLobby.name,
            duration: currentLobby.duration || 0,
          });
        } else if (currentLobby.status === "WAITING") {
          // Quiz hasn't started yet, redirect back to chat
          router.push(`/lobby/student/${lobbyId}`);
          return;
        }
      } else {
        // Lobby not found, redirect to lobby list
        router.push("/lobby/student");
        return;
      }
      setIsLoading(false);
    };

    const quizStartedHandler = (updatedLobby: any) => {
      if (updatedLobby.id === lobbyId) {
        setCurrentQuiz({
          id: updatedLobby.id,
          name: updatedLobby.name,
          duration: updatedLobby.duration || 0,
        });
        setLobby(updatedLobby);
        showNotification(`Mission "${updatedLobby.name}" is now active!`);
      }
    };

    const quizEndedHandler = ({ lobbyId: endedLobbyId }: any) => {
      if (endedLobbyId === lobbyId) {
        localStorage.removeItem("joinedLobby");
        showNotification("Mission completed. Thank you for your service!");
        // Redirect back to lobby list with a delay to show completion message
        setTimeout(() => {
          router.push("/lobby/student");
        }, 3000);
      }
    };

    const lobbyDeletedHandler = ({ lobbyId: deletedLobbyId }: any) => {
      if (deletedLobbyId === lobbyId) {
        localStorage.removeItem("joinedLobby");
        showNotification("The mission has been cancelled by command");
        router.push("/lobby/student");
      }
    };

    s.on("lobby-updated", lobbyUpdatedHandler);
    s.on("quiz-started", quizStartedHandler);
    s.on("quiz-ended", quizEndedHandler);
    s.on("lobby-deleted", lobbyDeletedHandler);

    return () => {
      s.off("lobby-updated", lobbyUpdatedHandler);
      s.off("quiz-started", quizStartedHandler);
      s.off("quiz-ended", quizEndedHandler);
      s.off("lobby-deleted", lobbyDeletedHandler);
    };
  }, [lobbyId, router]);

  // ===== Helpers =====
  const showNotification = (msg: string) => setNotification(msg);
  const dismissNotification = () => setNotification("");

  const goBackToChat = () => {
    router.push(`/lobby/student/${lobbyId}`);
  };

  const goBackToLobbyList = () => {
    router.push("/lobby/student");
  };

  // Loading UI
  if (isLoading) {
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
  }

  // Quiz completion UI
  if (currentQuiz && formattedTime == "00:00:00") {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            className="bg-white shadow-2xl border border-green-200 rounded-3xl p-12 text-center max-w-2xl mx-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                className="p-6 bg-green-500 rounded-full w-24 h-24 mx-auto mb-6 shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <CheckCircle className="w-12 h-12 text-white mx-auto" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Mission Complete!
              </h1>
              <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
                <Trophy className="w-6 h-6" />
                <span className="text-xl font-semibold">
                  {currentQuiz.name}
                </span>
              </div>
            </motion.div>

            <motion.div
              className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Training Complete
              </h3>
              <p className="text-green-700 font-medium">
                Your performance has been recorded and will be evaluated by
                command.
              </p>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.button
                onClick={goBackToLobbyList}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trophy className="w-5 h-5" />
                Return to Base
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Quiz Active UI
  if (currentQuiz) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="relative overflow-hidden bg-white shadow-lg"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
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
                  <motion.div
                    className="p-3 bg-main rounded-full shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      {currentQuiz.name}
                    </h1>
                    <p className="text-blue-600 font-medium">
                      Mission Status: ACTIVE
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-full text-sm font-semibold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  LIVE EXERCISE
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
                        <Target className="w-4 h-4 text-white" />
                      </motion.div>
                      <p className="text-gray-800 font-medium">
                        {notification}
                      </p>
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

            <div className="flex items-center justify-center min-h-[500px]">
              <motion.div
                className="bg-white shadow-2xl border border-blue-200 rounded-3xl p-12 text-center max-w-2xl mx-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  className="mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.div
                    className="p-6 bg-main rounded-full w-24 h-24 mx-auto mb-6 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{
                      rotate: { repeat: Infinity, duration: 3 },
                      scale: { duration: 0.2 },
                    }}
                  >
                    <Trophy className="w-12 h-12 text-white mx-auto" />
                  </motion.div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    {currentQuiz.name}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-blue-600 mb-6">
                    <Target className="w-5 h-5" />
                    <span className="text-xl font-semibold">
                      Mission Active
                    </span>
                  </div>
                </motion.div>

                {/* Mission Status Cards */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <motion.div
                    className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-center gap-3 text-gray-800 mb-2">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        Time Remaining
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-800">
                      {formattedTime}
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-green-50 border border-green-200 rounded-2xl p-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-center gap-3 text-gray-800 mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Status
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      Operational
                    </div>
                  </motion.div>
                </motion.div>

                {/* Mission Brief */}
                <motion.div
                  className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-bold text-gray-800">
                      Mission Instructions
                    </h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Your training exercise is now active. Follow all safety
                    protocols and complete assigned objectives within the
                    specified timeframe. Maintain communication discipline and
                    await further instructions from your commanding officer.
                  </p>
                </motion.div>

                {/* Status Indicator */}
                <motion.div
                  className="flex items-center justify-center gap-2 text-blue-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  <span className="font-medium">
                    Training exercise in progress...
                  </span>
                </motion.div>

                {/* Navigation Buttons */}
                {/* <motion.div
                  className="flex items-center justify-center gap-4 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <motion.button
                    onClick={goBackToChat}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium border-2 border-gray-300 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Comms
                  </motion.button>
                </motion.div> */}
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

  // No quiz data - redirect
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <motion.div
          className="mb-8"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          <AlertCircle className="w-24 h-24 text-yellow-500 mx-auto opacity-60" />
        </motion.div>
        <motion.h3
          className="text-2xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Mission Not Found
        </motion.h3>
        <motion.p
          className="text-gray-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          The requested mission could not be located or may have been cancelled.
        </motion.p>
        <motion.button
          onClick={goBackToLobbyList}
          className="bg-main hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Base
        </motion.button>
      </div>
    </motion.div>
  );
}
