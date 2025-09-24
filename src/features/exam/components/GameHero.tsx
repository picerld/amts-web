import { motion } from "framer-motion";

export const GameHero = ({
  showStudents,
  showButtons,
  typewriterText,
}: {
  showStudents: boolean;
  showButtons: boolean;
  typewriterText: string;
}) => {
  return (
    <div className="relative z-10 w-full flex items-center justify-center min-h-screen px-4">
      <motion.div
        className="flex flex-col max-w-6xl gap-8 justify-center text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="font-extrabold tracking-tighter text-6xl md:text-8xl flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
          <motion.div
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-300 to-cyan-300"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "backOut", delay: 0.3 }}
          >
            Start
          </motion.div>

          {showStudents && (
            <motion.div
              className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-300"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "backOut" }}
            >
              Exercise
            </motion.div>
          )}
        </div>

        <div className="text-xl text-gray-200 text-center min-h-[6rem] max-w-4xl mx-auto leading-relaxed">
          {typewriterText}
          <motion.span
            className="inline-block w-0.5 h-7 bg-blue-400 ml-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            &nbsp;
          </motion.span>
        </div>

        {showButtons && (
          <motion.div
            className="flex flex-col md:flex-row gap-6 pt-12 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: [1, 1.02, 1],
              }}
              transition={{
                delay: 0.1,
                scale: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              whileHover={{
                scale: 1.05,
                rotateX: [0, 5, 0],
                transition: {
                  scale: { duration: 0.2 },
                  rotateX: { duration: 0.5 },
                },
              }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer"
            >
              <motion.button
                className="relative px-16 py-6 text-2xl font-bold rounded-xl overflow-hidden
                       bg-gradient-to-b from-blue-500 to-blue-700 text-white
                       border-4 border-blue-400 group-hover:border-blue-300
                       shadow-2xl shadow-blue-500/50
                       transition-all duration-30 cursor-pointer"
                whileTap={{
                  scale: 1.05,
                  transition: { duration: 0.1, delay: 0.1 },
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                  animate={{ x: [-100, 100] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <span className="relative z-10 drop-shadow-lg flex items-center gap-3">
                  Start Now!
                </span>

                <motion.div
                  className="absolute inset-0 rounded-xl bg-blue-400 blur-xl -z-10"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.9, 1.1, 0.9],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: [1, 1.01, 1],
              }}
              transition={{
                delay: 0.3,
                scale: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              whileHover={{
                scale: 1.05,
                transition: { scale: { duration: 0.2 } },
              }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer"
            >
              <button
                className="relative px-16 py-6 text-2xl font-bold rounded-xl overflow-hidden
                       bg-gradient-to-b from-gray-600 to-gray-800 text-gray-100
                       border-4 border-gray-500 group-hover:border-gray-400
                       shadow-2xl shadow-gray-700/50
                       transition-all duration-300 cursor-pointer"
              >
                <span className="relative z-10 drop-shadow-lg flex items-center gap-3">
                  Exit
                </span>

                <motion.div
                  className="absolute inset-0 rounded-xl bg-gray-500 blur-xl -z-10"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
