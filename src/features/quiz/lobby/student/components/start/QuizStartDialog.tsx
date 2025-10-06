import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";

interface QuizStartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quizName: string;
  onStart?: () => void;
}

export const QuizStartDialog = ({
  isOpen,
  onClose,
  quizName,
  onStart,
}: QuizStartDialogProps) => {
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    if (!isOpen) return;

    setCount(3); // reset countdown when dialog opens
    let timer: NodeJS.Timeout;

    const tick = () => {
      setCount((prev) => {
        if (prev <= 1) {
          // Show "Mulai!" for 1 second before closing
          timer = setTimeout(() => {
            onStart?.();
            onClose();
          }, 1000);
          return 0; // show "Mulai!" immediately
        }
        return prev - 1;
      });
    };

    // Start countdown immediately
    timer = setInterval(tick, 1000);

    return () => clearInterval(timer); // cleanup on unmount
  }, [isOpen, onClose, onStart]);

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
              className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden p-8 text-center relative"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-4">{quizName}</h2>
              <p className="text-gray-600 mb-6">Quiz akan dimulai dalam:</p>

              <motion.div
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-6xl font-extrabold text-blue-600"
              >
                {count > 0 ? count : "Mulai!"}
              </motion.div>

              <div className="mt-6">
                <ButtonQuiz
                  onClick={() => {
                    onStart?.();
                    onClose();
                  }}
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Mulai Sekarang
                </ButtonQuiz>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
