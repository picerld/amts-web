"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LobbyData } from "@/types/lobby";
import InstructorLobbyCard from "./InstructorLobbyCard";
import { ANIMATION_VARIANTS } from "@/features/quiz/constans/lobbyConstans";

interface InstructorLobbyListProps {
  sortedLobbies: LobbyData[];
  joinLobby: (lobbyId: string, status: string) => void;
  startQuiz: (lobbyId: string) => void;
  endQuiz: (lobbyId: string) => void;
  deleteLobby: (lobbyId: string) => void;
}

export default function InstructorLobbyList({
  sortedLobbies,
  joinLobby,
  startQuiz,
  endQuiz,
  deleteLobby,
}: InstructorLobbyListProps) {
  return (
    <AnimatePresence mode="wait">
      {sortedLobbies.length === 0 ? (
        <motion.p
          key="no-lobbies"
          className="text-gray-500 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          No lobbies available yet.
        </motion.p>
      ) : (
        <motion.div
          className="grid gap-6"
          variants={ANIMATION_VARIANTS.container}
        >
          {sortedLobbies.map((lobby, index) => (
            <InstructorLobbyCard
              key={lobby.id}
              lobby={lobby}
              index={index}
              joinLobby={joinLobby}
              startQuiz={startQuiz}
              endQuiz={endQuiz}
              deleteLobby={deleteLobby}
              cardVariants={ANIMATION_VARIANTS.card}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
