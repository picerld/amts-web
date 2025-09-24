"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingContainer } from "./LoadingContainer";
import { Star } from "../types/star";

export default function GameLayoutContainer({
  children,
  isLoading,
  loadingProgress,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  loadingProgress: number;
}) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars: Star[] = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
    }));

    setStars(generatedStars);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      <AnimatePresence>
        {isLoading && (
          <LoadingContainer
            stars={stars}
            loadingProgress={loadingProgress}
          />
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0">
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4 + star.delay,
                  repeat: Infinity,
                  delay: star.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0">
            <motion.div
              className="absolute top-20 left-0 w-96 h-32 bg-blue-300 rounded-full opacity-8 blur-3xl"
              animate={{
                x: [-200, 1400],
                y: [0, -15, 0],
              }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute top-60 right-0 w-64 h-24 bg-cyan-200 rounded-full opacity-10 blur-2xl"
              animate={{
                x: [1400, -300],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 50,
                repeat: Infinity,
                ease: "linear",
                delay: 10,
              }}
            />
          </div>

          <div className="absolute top-10 left-10 opacity-20">
            <div className="w-24 h-24 border-4 border-blue-400 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {children}

          <motion.div
            className="absolute bottom-10 right-10 opacity-15"
            animate={{
              y: [0, -8, 0],
              rotate: [0, 1, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-16 h-8 bg-blue-300 transform rotate-12 rounded-full relative">
              <div className="absolute top-2 left-2 w-2 h-2 bg-blue-300 rounded-full"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-300 rounded-full"></div>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-32 right-20 opacity-10"
            animate={{
              y: [0, -10, 0],
              rotate: [0, -0.5, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          >
            <div className="w-12 h-6 bg-cyan-300 transform -rotate-12 rounded-full relative">
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}