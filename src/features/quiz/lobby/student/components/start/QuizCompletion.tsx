import { CheckCircle, Trophy } from "lucide-react";
import { motion } from 'framer-motion';

interface QuizCompletionProps {
  quizName: string;
  onReturnToBase: () => void;
}

export const QuizCompletion = ({
  quizName,
  onReturnToBase,
}: QuizCompletionProps) => {
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
              <span className="text-xl font-semibold">{quizName}</span>
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
              onClick={onReturnToBase}
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
};
