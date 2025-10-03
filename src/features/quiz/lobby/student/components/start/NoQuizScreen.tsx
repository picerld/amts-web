import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface NoQuizScreenProps {
  onReturnToBase: () => void;
}

export const NoQuizScreen = ({ onReturnToBase }: NoQuizScreenProps) => {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <motion.div
          className="mb-8"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          <AlertCircle className="w-24 h-24 text-yellow-500 mx-auto opacity-60" />
        </motion.div>
        <motion.h3
          className="text-2xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Mission Not Found
        </motion.h3>
        <motion.p
          className="text-gray-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          The requested mission could not be located or may have been cancelled.
        </motion.p>
        <motion.button
          onClick={onReturnToBase}
          className="bg-main hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Base
        </motion.button>
      </div>
    </motion.div>
  );
};