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
  const [clouds, setClouds] = useState<Star[]>([]);

  useEffect(() => {
    const generatedClouds: Star[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60 + 10,
      size: Math.random() * 30 + 20,
      delay: Math.random() * 10,
    }));

    setClouds(generatedClouds);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-300 via-blue-200 to-sky-100">
      <AnimatePresence>
        {isLoading && (
          <LoadingContainer
            stars={clouds}
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
          {/* Cloud elements */}
          <div className="absolute inset-0">
            {clouds.map((cloud) => (
              <motion.div
                key={cloud.id}
                className="absolute bg-white rounded-full opacity-70 blur-sm"
                style={{
                  left: `${cloud.x}%`,
                  top: `${cloud.y}%`,
                  width: `${cloud.size}px`,
                  height: `${cloud.size * 0.6}px`,
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1],
                  x: [0, 20, 0],
                }}
                transition={{
                  duration: 15 + cloud.delay,
                  repeat: Infinity,
                  delay: cloud.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0">
            <motion.div
              className="absolute top-20 left-0 w-96 h-32 bg-yellow-200 rounded-full opacity-20 blur-3xl"
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
              className="absolute top-60 right-0 w-64 h-24 bg-orange-100 rounded-full opacity-15 blur-2xl"
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

          <div className="absolute top-10 left-10 opacity-80">
            <div className="w-24 h-24 border-4 border-yellow-300 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-b from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 bg-yellow-200 rounded-full"></div>
              </div>
            </div>
          </div>

          {children}

          <motion.div
            className="absolute bottom-10 left-10 opacity-40"
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
            <div className="w-16 h-8 bg-sky-200 transform rotate-12 rounded-full relative shadow-sm">
              <div className="absolute top-2 left-2 w-2 h-2 bg-sky-100 rounded-full"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-sky-100 rounded-full"></div>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-32 left-44 opacity-30"
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
            <div className="w-12 h-6 bg-blue-200 transform -rotate-12 rounded-full relative shadow-sm">
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-blue-100 rounded-full"></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-100 rounded-full"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}