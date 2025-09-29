"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ButtonQuiz } from "@/features/quizz/components/ui/button-quiz";
import { InputFieldQuizz } from "@/features/quizz/components/ui/input-field-quizz";
import { Compass } from "lucide-react";

interface CreateLobbyFormProps {
  lobbyName: string;
  setLobbyName: (value: string) => void;
  lobbyDuration: number;
  setLobbyDuration: (value: number) => void;
  isCreating: boolean;
  createLobby: () => void;
}

export default function CreateLobbyForm({
  lobbyName,
  setLobbyName,
  lobbyDuration,
  setLobbyDuration,
  isCreating,
  createLobby,
}: CreateLobbyFormProps) {
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    if (!lobbyName.trim() || !lobbyDuration) {
      setShowError(true);
      return;
    }
    setShowError(false);
    createLobby();
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold mb-4">Deploy new lobby</h2>

      <div className="flex flex-col md:flex-row gap-3">
        <motion.div
          animate={
            showError && !lobbyName.trim()
              ? { scale: [1, 1.05, 1], x: [0, -6, 6, -6, 6, 0] }
              : {}
          }
          transition={{ duration: 0.4 }}
          className="w-full relative"
        >
          <InputFieldQuizz
            type="text"
            placeholder="Lobby"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
          />

          {showError && !lobbyName.trim() && (
            <motion.div
              className="absolute top-0 right-0 -rotate-3 px-4 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800 shadow-sm border border-red-300"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Required
            </motion.div>
          )}
        </motion.div>

        <motion.div
          animate={
            showError && !lobbyDuration
              ? { scale: [1, 1.05, 1], x: [0, -6, 6, -6, 6, 0] }
              : {}
          }
          transition={{ duration: 0.4 }}
          className="w-full relative"
        >
          <InputFieldQuizz
            type="number"
            min="1"
            placeholder="Duration (minutes)"
            value={lobbyDuration || ""}
            onChange={(e) => setLobbyDuration(parseInt(e.target.value))}
          />
          {showError && !lobbyDuration && (
            <motion.div
              className="absolute top-0 right-0 -rotate-3 px-4 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800 shadow-sm border border-red-300"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Required
            </motion.div>
          )}
        </motion.div>

        <ButtonQuiz
          variant="softPrimary"
          onClick={handleSubmit}
          disabled={isCreating}
          className="px-5"
        >
          {isCreating ? "Deploying..." : "Deploy"}
          <Compass className="w-5 h-5 ml-2" strokeWidth={2.5} />
        </ButtonQuiz>
      </div>
    </motion.div>
  );
}
