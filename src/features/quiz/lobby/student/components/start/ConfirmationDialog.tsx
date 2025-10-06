// ========================================
// FILE: ConfirmationDialog.tsx (NEW FILE)
// Path: @/features/quiz/lobby/student/components/start/ConfirmationDialog.tsx
// ========================================

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "warning",
}: ConfirmationDialogProps) => {
  const colorClasses = {
    warning: {
      bg: "from-yellow-50 to-orange-50",
      border: "border-yellow-200",
      icon: "text-yellow-600",
      iconBg: "bg-yellow-100",
    },
    danger: {
      bg: "from-red-50 to-orange-50",
      border: "border-red-200",
      icon: "text-red-600",
      iconBg: "bg-red-100",
    },
    info: {
      bg: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      iconBg: "bg-blue-100",
    },
  };

  const colors = colorClasses[type];

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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`bg-gradient-to-br ${colors.bg} border-b-2 ${colors.border} p-6 relative`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`${colors.iconBg} p-3 rounded-xl`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 leading-relaxed mb-6">{message}</p>

                <div className="flex gap-3">
                  <ButtonQuiz
                    onClick={onClose}
                    variant="secondaryGray"
                    className="flex-1"
                  >
                    {cancelText}
                  </ButtonQuiz>
                  <ButtonQuiz
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    variant="primary"
                    className="flex-1"
                  >
                    {confirmText}
                  </ButtonQuiz>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};