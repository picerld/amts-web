"use client";

import { motion } from "framer-motion";
import {
  Users,
  Clock,
  Star,
  Shield,
  Target,
  CheckCircle,
  Plane,
} from "lucide-react";
import { LobbyData } from "@/types/lobby";
import { ButtonQuiz } from "@/features/quizz/components/ui/button-quiz";
import { QuizConfirmDialog } from "@/features/quizz/components/container/QuizConfirmDialog";
import { useRouter } from "next/navigation";

export const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
  hover: { scale: 1.02 },
};

interface InstructorLobbyCardProps {
  lobby: LobbyData;
  index: number;
  joinLobby: (lobbyId: string, status: string) => void;
  startQuiz: (id: string) => void;
  endQuiz: (id: string) => void;
  deleteLobby: (id: string) => void;
  cardVariants: typeof cardVariants;
}

export default function InstructorLobbyCard({
  lobby,
  index,
  joinLobby,
  startQuiz,
  endQuiz,
  deleteLobby,
  cardVariants,
}: InstructorLobbyCardProps) {
  const router = useRouter();

  return (
    <motion.div
      key={lobby.id}
      className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl"
      variants={cardVariants}
      whileHover="hover"
      layout
      custom={index}
    >
      <motion.div className="flex items-start justify-between mb-6">
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

      <motion.div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          className="bg-blue-50 border border-blue-100 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Joined</span>
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

      <motion.div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <h4 className="text-gray-800 font-semibold mb-2 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Mission Briefing
        </h4>
        <p className="text-gray-600 text-sm">
          Tactical training exercise to prepare cadets for live operations.
        </p>
      </motion.div>

      <div className="flex gap-3">
        {lobby.status === "WAITING" && (
          <div className="flex flex-col gap-3 w-full">
            <ButtonQuiz
              onClick={() => joinLobby(lobby.id, lobby.status)}
              variant={"softPrimary"}
              className="w-full"
            >
              <Users className="w-5 h-5" /> Join to Lobby
            </ButtonQuiz>

            <div className="grid grid-cols-2 gap-3">
              <ButtonQuiz variant={"start"} onClick={() => startQuiz(lobby.id)}>
                <Target className="w-5 h-5" /> Start Mission
              </ButtonQuiz>

              <QuizConfirmDialog
                trigger={
                  <ButtonQuiz variant={"abort"} className="w-full">
                    <Shield className="w-5 h-5" /> Abort
                  </ButtonQuiz>
                }
                title="Confirm Abort"
                description="Are you sure you want to abort this mission?"
                confirmText="Yes, Abort!"
                cancelText="No, Cancel!"
                onConfirm={() => deleteLobby(lobby.id)}
              />
            </div>
          </div>
        )}

        {lobby.status === "ONGOING" && (
          <ButtonQuiz variant={"softPrimary"} onClick={() => endQuiz(lobby.id)}>
            <Target className="w-5 h-5" /> End Mission
          </ButtonQuiz>
        )}

        {lobby.status === "FINISHED" && (
          <div className="flex flex-col gap-3 w-full">
            <ButtonQuiz
              onClick={() => router.push(`/lobby/instructor/${lobby.id}`)}
              variant={"softPrimary"}
              className="w-full"
            >
              <Target className="w-5 h-5" /> See Result
            </ButtonQuiz>
            <div className="grid grid-cols-2 gap-3">
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
          </div>
        )}
      </div>
    </motion.div>
  );
}
