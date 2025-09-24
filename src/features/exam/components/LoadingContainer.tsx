import { motion } from "framer-motion";
import { Star } from "../types/star";

export const LoadingContainer = ({
  stars,
  loadingProgress,
}: {
  stars: Star[];
  loadingProgress: number;
}) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-sky-300 via-blue-200 to-sky-100"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="absolute inset-0">
        {stars.slice(0, 15).map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full opacity-60 blur-sm"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size * 0.6}px`,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.1, 1],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 8 + star.delay,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8">
        <motion.div
          className="w-24 h-24 border-4 border-yellow-400 rounded-full flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-b from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-8 h-8 bg-yellow-100 rounded-full"></div>
          </motion.div>
        </motion.div>

        <motion.h2
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Loading...
        </motion.h2>

        <div className="w-80 max-w-md">
          <div className="h-3 bg-white/40 rounded-full overflow-hidden border border-gray-300 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full shadow-sm"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <motion.p
            className="text-gray-800 text-center mt-4 text-lg font-semibold"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {Math.round(Math.min(loadingProgress, 100))}%
          </motion.p>
        </div>

        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"
              animate={{
                y: [0, -12, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-16 bg-yellow-200 rounded-full opacity-20 blur-2xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-32 right-20 w-24 h-12 bg-orange-100 rounded-full opacity-15 blur-xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
    </motion.div>
  );
};