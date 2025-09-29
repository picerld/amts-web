"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface LobbyHeaderProps {
  children?: React.ReactNode;
  lobby?: {
    name?: string;
    status?: string;
    instructor?: { username?: string };
  };
  withBack?: boolean;
  backHref?: string;
}

export default function LobbyHeader({
  children,
  lobby,
  withBack = false,
  backHref = "/lobby",
}: LobbyHeaderProps) {
  const router = useRouter();

  const goBackToLobbyList = () => {
    localStorage.removeItem("joinedLobby");
    router.push(backHref);
  };

  const title = lobby?.name || "AFTS T50";
  const subtitle = lobby
    ? `Commander: ${lobby.instructor?.username || "Unknown"}`
    : "Lobby Quiz";
  const status = lobby?.status;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100"
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="relative overflow-hidden bg-white shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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
                {withBack && (
                  <motion.button
                    onClick={goBackToLobbyList}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 border border-blue-300 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                )}

                <motion.div
                  className="p-3 bg-main rounded-full shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                  <p className="text-blue-600 font-medium">{subtitle}</p>
                </div>
              </motion.div>

              {status && (
                <motion.div
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    status === "ONGOING"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : "bg-green-100 text-green-700 border border-green-300"
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {status}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </motion.div>
  );
}
