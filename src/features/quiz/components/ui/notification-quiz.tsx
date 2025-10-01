"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CircleX } from "lucide-react";

interface Props {
  visible: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
}

const NotificationQuizz = ({ visible, title, description, onClose }: Props) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [0.9, 1.02, 1],
            transition: { duration: 0.4, ease: "easeOut", delay: 0.1 },
          }}
          exit={{
            opacity: 0,
            y: 100,
            scale: 0.95,
            transition: { duration: 0.4, ease: "easeInOut" },
          }}
          className="absolute right-10 top-10 bg-blue-600 text-white shadow-lg p-6 rounded-2xl w-96 overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-blue-700 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col">
              <p className="font-semibold text-lg leading-tight">
                {title || "Notification"}
              </p>
              {description && (
                <p className="text-sm mt-1 leading-snug">{description}</p>
              )}
            </div>
          </div>

          <div
            className="absolute right-3 top-2 cursor-pointer"
            onClick={onClose}
          >
            <CircleX />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationQuizz;
