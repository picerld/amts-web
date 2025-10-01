import { AnimatePresence } from "motion/react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export default function LoadingWithCard({
  notification,
  dismissNotification,
}: {
  notification: string;
  dismissNotification: () => void;
}) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-md"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 bg-blue-600 rounded-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <MessageSquare className="w-4 h-4 text-white" />
              </motion.div>
              <p className="text-gray-800 font-medium">{notification}</p>
            </div>
            <motion.button
              onClick={dismissNotification}
              className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Dismiss
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
