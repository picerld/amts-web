"use client";

import { motion } from "framer-motion";
import { Users, Clock, Star, Target, Plane, GraduationCap } from "lucide-react";
import { LobbyData } from "@/types/lobby";
import { ANIMATION_VARIANTS } from "@/features/quiz/constans/lobbyConstans";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { useRouter } from "next/navigation";

interface StudentLobbyCardProps {
  lobby: LobbyData;
  index: number;
  isJoining: string | null;
  joinLobby: (lobbyId: string, status: string) => void;
}

export default function StudentLobbyCard({
  lobby,
  index,
  isJoining,
  joinLobby,
}: StudentLobbyCardProps) {
  const router = useRouter();

  return (
    <motion.div
      key={lobby.id}
      className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl"
      variants={ANIMATION_VARIANTS.card}
      whileHover="hover"
      layout
      custom={index}
    >
      <motion.div
        className="flex items-start justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="p-3 bg-blue-50 rounded-full border-2 border-blue-200"
            whileHover={{ scale: 1.1 }}
          >
            <Plane className="w-6 h-6 text-blue-600" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{lobby.name}</h3>
            <p className="text-blue-600 text-sm font-medium">
              Instructor: {lobby.instructor?.username || "Unknown"}
            </p>
            <p className="text-gray-500 text-xs">
              Mission ID: {lobby.id.slice(0, 6).toUpperCase() + "****"}
            </p>
            <p className="text-gray-600 text-xs">
              Date:{" "}
              {new Date(lobby.createdAt ?? new Date()).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

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
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-4 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
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

      <motion.div
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        <h4 className="text-gray-800 font-semibold mb-2 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
          Lobby Briefing
        </h4>
        <p className="text-gray-600 text-sm">-</p>
      </motion.div>

      {lobby.status === "FINISHED" ? (
        <ButtonQuiz
          onClick={() => {
            router.push(`/lobby/student/${lobby.id}/finished`);
          }}
          variant={"primary"}
          className="w-full"
        >
          <GraduationCap className="w-5 h-5" />
          Review Results
        </ButtonQuiz>
      ) : (
        <motion.button
          className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 border-2 ${
            isJoining === lobby.id
              ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
              : "bg-blue-600 cursor-pointer hover:bg-blue-700 text-white border-blue-600 shadow-lg"
          }`}
          onClick={() => joinLobby(lobby.id, lobby.status)}
          disabled={isJoining === lobby.id}
          whileHover={isJoining !== lobby.id ? { scale: 1.02 } : {}}
          whileTap={isJoining !== lobby.id ? { scale: 0.98 } : {}}
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            transition: { delay: index * 0.1 + 0.4 },
          }}
        >
          {isJoining === lobby.id ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear",
                }}
              />
              Enlisting...
            </>
          ) : (
            <>
              <Target className="w-5 h-5" />
              Enlist for Mission
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
}
