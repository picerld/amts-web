"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { Shield, GraduationCap } from "lucide-react";
import LobbyHeader from "@/features/quizz/components/container/LobbyHeader";
import Link from "next/link";
import { ButtonQuiz } from "../../components/ui/button-quiz";

export default function LobbyPage() {
  const [role, setRole] = useState<"instructor" | "student" | null>(null);

  useEffect(() => {
    const storedRole = Cookies.get("auth.role");
    if (storedRole === "1") {
      setRole("instructor");
    } else {
      setRole("student");
    }
  }, []);

  return (
    <LobbyHeader>
      <AnimatePresence mode="wait">
        {role && (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <div
              className={`p-8 rounded-2xl shadow-xl border ${
                role === "instructor"
                  ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                  : "bg-gradient-to-r from-green-600 to-green-800 text-white"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-white/20 rounded-full shadow-lg">
                  {role === "instructor" ? (
                    <Shield className="w-10 h-10" />
                  ) : (
                    <GraduationCap className="w-10 h-10" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold">
                    {role === "instructor"
                      ? "Instructor Panel"
                      : "Student Panel"}
                  </h1>
                  <p className="opacity-90 font-medium">
                    {role === "instructor"
                      ? "Create and manage your quizzes with ease."
                      : "Join a quiz and test your knowledge."}
                  </p>
                </div>
              </div>

              <Link href={`/lobby/${role}`} className="w-full">
                <ButtonQuiz
                  variant="secondary"
                  className="w-full"
                  icon={role === "instructor" ? Shield : GraduationCap}
                >
                  {role === "instructor"
                    ? "Go to Instructor Panel"
                    : "Go to Student Panel"}
                </ButtonQuiz>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LobbyHeader>
  );
}
