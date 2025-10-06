import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, Star, X, CheckCircle, XCircle } from "lucide-react";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";

interface QuizResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  totalQuestions: number;
  quizName: string;
  onReturnToLobby?: () => void;
}

export const QuizResultsDialog = ({
  isOpen,
  onClose,
  score,
  totalQuestions,
  quizName,
  onReturnToLobby,
}: QuizResultsDialogProps) => {
  const percentage = (score / totalQuestions) * 100;
  const isPassed = percentage >= 60;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              transition={{ duration: 0.5, type: "spring" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold">Quiz Selesai!</h3>
                  <p className="text-blue-100 mt-1">{quizName}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 text-center">
                <motion.div
                  className="relative w-32 h-32 mx-auto mb-6"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r bg-blue-700 rounded-full opacity-20 blur-xl" />
                  <div className="relative w-full h-full bg-gradient-to-br bg-blue-700 rounded-full flex items-center justify-center shadow-xl">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>
                </motion.div>

                <motion.h2
                  className="text-4xl font-black text-gray-900 mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {isPassed ? "Luar Biasa!" : "Tetap Semangat!"}
                </motion.h2>

                <motion.p
                  className="text-xl text-gray-600 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {isPassed
                    ? "Kamu telah menyelesaikan misi dengan baik!"
                    : "Terus berlatih untuk hasil yang lebih baik!"}
                </motion.p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-900">
                      {score}/{totalQuestions}
                    </p>
                    <p className="text-sm text-gray-600">Jawaban Benar</p>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-900">
                      {percentage.toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-600">Akurasi</p>
                  </motion.div>

                  <motion.div
                    className={`bg-gradient-to-br rounded-2xl p-6 border-2 ${
                      isPassed
                        ? "from-green-50 to-emerald-50 border-green-200"
                        : "from-red-50 to-orange-50 border-red-200"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    {isPassed ? (
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    )}
                    <p
                      className={`text-3xl font-bold ${
                        isPassed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPassed ? "Lulus" : "Belum"}
                    </p>
                    <p className="text-sm text-gray-600">Status</p>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  className="flex gap-4 justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <ButtonQuiz onClick={onClose} variant="secondary" className="bg-gray-100 hover:bg-gray-200">
                    Lihat Jawaban
                  </ButtonQuiz>
                  {onReturnToLobby && (
                    <ButtonQuiz
                      onClick={onReturnToLobby}
                      variant="primary"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Kembali ke Lobby
                    </ButtonQuiz>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};