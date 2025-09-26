"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

function LobbyHeader({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100"
      variants={containerVariants}
    >
      <motion.div
        className="relative overflow-hidden bg-white shadow-lg"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex items-center gap-4 mb-2"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="p-3 bg-main rounded-full shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">AFTS T50</h1>
                <p className="text-blue-600 font-medium">Lobby Quiz</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </motion.div>
  );
}

export default LobbyHeader;
