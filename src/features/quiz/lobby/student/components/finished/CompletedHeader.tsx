import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { ANIMATION_VARIANTS } from "@/features/quiz/constans/lobbyConstans";
import { LobbyData } from "@/types/lobby";
import { motion } from "framer-motion";
import { Award, ChevronLeft } from "lucide-react";

export default function CompletedHeader({
  lobby,
  score,
  totalQuestions,
  percentage,
  onReturnToLobby,
}: {
  lobby: LobbyData;
  score: number;
  totalQuestions: number;
  percentage: number;
  onReturnToLobby?: () => void;
}) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-8 mb-8"
      variants={ANIMATION_VARIANTS.container}
      initial="initial"
      animate="animate"
    >
      <div className="text-center mb-6">
        <motion.div
          className="relative w-32 h-32 mx-auto mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r bg-blue-700 rounded-full opacity-20 blur-xl" />
          <div className="relative w-full h-full bg-gradient-to-br bg-blue-700 rounded-full flex items-center justify-center shadow-xl">
            <Award className="size-16 text-white" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-3xl font-bold text-gray-800 mb-2"
        >
          Mission Complete!
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-gray-600 text-lg"
        >
          {lobby.name}
        </motion.p>
      </div>

      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="text-center">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.95 }}
            className="text-5xl font-bold text-indigo-600"
          >
            {score}
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.98 }}
            className="text-gray-600"
          >
            Correct
          </motion.p>
        </div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-4xl text-gray-400"
        >
          /
        </motion.div>
        <div className="text-center">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.95 }}
            className="text-5xl font-bold text-gray-700"
          >
            {totalQuestions}
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.98 }}
            className="text-gray-600"
          >
            Questions
          </motion.p>
        </div>
      </div>

      <motion.div
        className="max-w-md mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.98 }}
      >
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.96 }}
          >
            Score
          </motion.span>
          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="font-semibold inline-block origin-bottom"
          >
            {percentage.toFixed(1)}%
          </motion.span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full ${
              percentage >= 80
                ? "bg-green-500"
                : percentage >= 60
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-6 text-center"
      >
        <ButtonQuiz onClick={onReturnToLobby}>
          <ChevronLeft className="mr-2" /> Back to Lobby
        </ButtonQuiz>
      </motion.div>
    </motion.div>
  );
}
