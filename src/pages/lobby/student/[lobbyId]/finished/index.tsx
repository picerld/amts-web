"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useStudentLobbyFinished } from "@/features/quiz/lobby/student/hooks/useStudentLobbyFinished";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import { NoQuizScreen } from "@/features/quiz/lobby/student/components/start/NoQuizScreen";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import LoadingWithCard from "@/features/quiz/components/dialog/LoadingWithCard";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { motion } from "framer-motion";
import AnimatedQuestion from "@/features/quiz/lobby/student/components/finished/AnimatedQuestion";
import CompletedHeader from "@/features/quiz/lobby/student/components/finished/CompletedHeader";
import { ChevronUp } from "lucide-react";

export default function StudentQuizFinished() {
  const router = useRouter();
  const { lobbyId } = router.query;

  const [notification, setNotification] = useState<string>("");

  const {
    lobby,
    questions,
    isLoading,
    loadingError,
    score,
    totalQuestions,
    getUserAnswer,
    isCorrectAnswer,
    goBackToLobby,
  } = useStudentLobbyFinished({
    lobbyId: lobbyId?.toString() ?? "",
    onNotification: setNotification,
  });

  const dismissNotification = () => setNotification("");

  if (loadingError) {
    return <NoQuizScreen onReturnToBase={goBackToLobby} />;
  }

  if (isLoading) {
    return (
      <LoaderWithPlane
        title="Loading results..."
        subtitle="Preparing your mission report"
      />
    );
  }

  if (!lobby) {
    return <NoQuizScreen onReturnToBase={goBackToLobby} />;
  }

  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  return (
    <LobbyHeader
      padded={false}
      status="FINISHED"
      statusConfig={{
        FINISHED: {
          label: "Mission Complete",
          className: "bg-green-100 text-green-700 border border-green-300",
          animated: true,
        },
      }}
    >
      <HeadMetaData title="Quiz Results" />

      <LoadingWithCard
        notification={notification}
        dismissNotification={dismissNotification}
      />

      <div className="px-4 md:px-8 lg:px-32 py-8">
        <CompletedHeader
          lobby={lobby}
          score={score}
          percentage={percentage}
          totalQuestions={totalQuestions}
          onReturnToLobby={goBackToLobby}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Review Answers
          </h2>

          <div className="grid grid-cols-1 gap-10">
            {questions.map((question, qIndex) => (
              <AnimatedQuestion
                key={question.id}
                question={question}
                qIndex={qIndex}
                getUserAnswer={getUserAnswer}
                isCorrectAnswer={isCorrectAnswer}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center"
        >
          <ButtonQuiz
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <ChevronUp /> Scroll to Top
          </ButtonQuiz>
        </motion.div>
      </div>
    </LobbyHeader>
  );
}
