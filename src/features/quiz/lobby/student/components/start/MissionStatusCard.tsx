import { motion } from "framer-motion";
import { Trophy, Target, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface MissionStatusCardProps {
  quizName: string;
  formattedTime: string;
}

export const MissionStatusCard = ({
  quizName,
  formattedTime,
}: MissionStatusCardProps) => {
  return (
    <motion.div
      className="bg-white shadow-2xl border border-blue-200 rounded-3xl p-12 text-center max-w-2xl mx-6"
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
          className="p-6 bg-main rounded-full w-24 h-24 mx-auto mb-6 shadow-lg"
          whileHover={{ scale: 1.1 }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{
            rotate: { repeat: Infinity, duration: 3 },
            scale: { duration: 0.2 },
          }}
        >
          <Trophy className="w-12 h-12 text-white mx-auto" />
        </motion.div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{quizName}</h2>
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-6">
          <Target className="w-5 h-5" />
          <span className="text-xl font-semibold">Mission Active</span>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center gap-3 text-gray-800 mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              Time Remaining
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {formattedTime}
          </div>
        </motion.div>

        <motion.div
          className="bg-green-50 border border-green-200 rounded-2xl p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center gap-3 text-gray-800 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-600">Status</span>
          </div>
          <div className="text-lg font-bold text-gray-800">Operational</div>
        </motion.div>
      </motion.div>

      <motion.div
        className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-bold text-gray-800">
            Mission Instructions
          </h3>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">
          Your training exercise is now active. Follow all safety protocols and
          complete assigned objectives within the specified timeframe. Maintain
          communication discipline and await further instructions from your
          commanding officer.
        </p>
      </motion.div>

      <motion.div
        className="flex items-center justify-center gap-2 text-blue-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.div
          className="w-3 h-3 bg-blue-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        <span className="font-medium">Training exercise in progress...</span>
      </motion.div>
    </motion.div>
  );
};
