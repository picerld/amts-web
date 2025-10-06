import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { motion } from "framer-motion";
import { Trophy, Clock, Target, Flag } from "lucide-react";

interface MissionStatusCardProps {
  quizName: string;
  formattedTime: string;
  onSubmit?: () => void;
  answeredCount?: number;
  totalQuestions?: number;
}

export const MissionStatusCard = ({
  quizName,
  formattedTime,
  onSubmit,
  answeredCount = 0,
  totalQuestions = 0,
}: MissionStatusCardProps) => {
  return (
    <div className="flex gap-5">
      <motion.div
        className="bg-white border border-blue-200 rounded-3xl py-4 px-10 w-full"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.div
              className="bg-blue-700 p-4 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{
                rotate: { repeat: Infinity, duration: 4 },
                scale: { duration: 0.2 },
              }}
            >
              <Trophy className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{quizName}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-lg text-blue-600 font-semibold">
                  Mission Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {onSubmit && (
              <ButtonQuiz
                onClick={onSubmit}
                className="flex items-center gap-3"
              >
                <Flag className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-base font-bold">Submit Quiz</div>
                  <div className="text-sm opacity-90">
                    {answeredCount}/{totalQuestions} Terjawab
                  </div>
                </div>
              </ButtonQuiz>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex items-center gap-3 bg-white border border-blue-200 px-8 py-4 rounded-2xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
      >
        <Clock className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
        <div>
          <span className="text-sm font-medium text-blue-600 block truncate">
            Time Remaining
          </span>
          <span className="text-3xl font-bold text-gray-800">
            {formattedTime}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
