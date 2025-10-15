// ============================================
// FILE 1: app/lobby/student/page.tsx
// ============================================
"use client";

import { useState, useEffect } from "react";
import {
  ANIMATION_VARIANTS,
  SOCKET_EVENTS,
} from "@/features/quiz/constans/lobbyConstans";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { UseStudentLobbyList } from "../hooks";
import { getSocket, initializeSocket } from "@/utils/socket";
import LoadingWithCard from "@/features/quiz/components/dialog/LoadingWithCard";
import { generateUserId } from "@/features/quiz/utils/lobbyHelpers";
import Cookies from "js-cookie";
import { CheckCircle2, Radar, RefreshCw, Shield, Target } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import StudentLobbyCard from "../components/StudentLobbyCard";

export default function StudentPage() {
  const [notification, setNotification] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [socketReady, setSocketReady] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"available" | "completed">(
    "available"
  );

  useEffect(() => {
    let userId = Cookies.get("user.id") || null;

    if (!userId) {
      userId = generateUserId();
      Cookies.set("user.id", userId, { expires: 365 });
    }

    try {
      const socket = initializeSocket();

      if (socket.connected) {
        setSocketReady(true);
      } else {
        socket.once("connect", () => {
          console.log("✅ Socket connected and ready");
          setSocketReady(true);
        });
      }
    } catch (error) {
      console.error("❌ Failed to initialize socket:", error);
      setSocketReady(true);
    }
  }, []);

  const { lobbies, isJoining, joinLobby } = UseStudentLobbyList({
    onNotification: (title, description) =>
      setNotification(`${title}: ${description}`),
  });

  useEffect(() => {
    if (lobbies !== undefined && socketReady) {
      setIsLoading(false);
    }
  }, [lobbies, socketReady]);

  const showNotification = (msg: string) => setNotification(msg);
  const dismissNotification = () => setNotification("");

  const refreshLobbies = () => {
    setIsLoading(true);
    showNotification("Scanning for new missions...");

    const s = getSocket();
    s.emit(SOCKET_EVENTS.GET_LOBBIES);

    setTimeout(() => {
      setIsLoading(false);
      dismissNotification();
    }, 1500);
  };

  if (isLoading) {
    return <LoaderWithPlane />;
  }

  const availableLobbies =
    lobbies?.filter((l) => l.status !== "FINISHED") || [];
  const completedLobbies = lobbies?.filter((l) => l.status == "FINISHED") || [];

  const tabs = [
    {
      id: "available",
      label: "Available Missions",
      icon: Target,
      count: availableLobbies.length,
      color: "blue",
    },
    {
      id: "completed",
      label: "Completed Missions",
      icon: CheckCircle2,
      count: completedLobbies.length,
      color: "green",
    },
  ];

  const currentLobbies =
    activeTab === "available" ? availableLobbies : completedLobbies;

  const TabsComponent = (
    <div className="flex gap-4 border-b border-gray-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "available" | "completed")}
            className={`relative px-6 py-3 font-semibold flex items-center gap-3 transition-colors ${
              isActive
                ? tab.color === "blue"
                  ? "text-blue-600"
                  : "text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            whileHover={{ y: -2 }}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                isActive
                  ? tab.color === "blue"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {tab.count}
            </span>
            {isActive && (
              <motion.div
                className={`absolute bottom-0 left-0 right-0 h-1 ${
                  tab.color === "blue" ? "bg-blue-600" : "bg-green-600"
                }`}
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const RefreshButton = (
    <motion.button
      onClick={refreshLobbies}
      className="bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold shadow-md flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <RefreshCw className="w-4 h-4" />
      Refresh
    </motion.button>
  );

  return (
    <LobbyHeader
      title="Mission Control"
      subtitle="Select your training missions and track your progress"
      icon={Shield}
      rightContent={RefreshButton}
    >
      <HeadMetaData title="Student Lobby" />

      <LoadingWithCard
        notification={notification}
        dismissNotification={dismissNotification}
      />

      <motion.div className="px-10" variants={ANIMATION_VARIANTS.container}>
        <div className="flex gap-4 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as "available" | "completed")
                }
                className={`relative cursor-pointer px-6 py-3 font-semibold flex items-center gap-3 transition-colors ${
                  isActive
                    ? tab.color === "blue"
                      ? "text-blue-600"
                      : "text-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ y: -2 }}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive
                      ? tab.color === "blue"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
                {isActive && (
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 ${
                      tab.color === "blue" ? "bg-blue-600" : "bg-green-600"
                    }`}
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentLobbies.length === 0 ? (
              <motion.div className="text-center py-24">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                >
                  <Radar className="w-24 h-24 text-blue-300 mx-auto mb-6 opacity-50" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {activeTab === "available"
                    ? "No Active Missions"
                    : "No Completed Missions Yet"}
                </h3>
                <p className="text-blue-600 mb-6">
                  {activeTab === "available"
                    ? "Waiting for command to deploy training missions"
                    : "Complete some missions to see them here"}
                </p>
                {activeTab === "available" && (
                  <motion.button
                    onClick={refreshLobbies}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw className="w-5 h-5" />
                    Scan Again
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div className="grid gap-6 py-6">
                {currentLobbies.map((lobby, index) => (
                  <StudentLobbyCard
                    key={lobby.id}
                    lobby={lobby}
                    index={index}
                    isJoining={isJoining}
                    joinLobby={joinLobby}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </LobbyHeader>
  );
}
