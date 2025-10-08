"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { useStudentLobbyFinished } from "@/features/quiz/lobby/student/hooks/useStudentLobbyFinished";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import { NoQuizScreen } from "@/features/quiz/lobby/student/components/start/NoQuizScreen";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import LoadingWithCard from "@/features/quiz/components/dialog/LoadingWithCard";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import {
  CheckCircle2,
  XCircle,
  Award,
  ChevronLeft,
  ChevronUp,
} from "lucide-react";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { motion, useInView } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/features/quiz/constans/lobbyConstans";
import { IAnswer } from "@/types/answer";
import { IQuestion } from "@/types/question";

function AnimatedQuestion({
  question,
  qIndex,
  getUserAnswer,
  isCorrectAnswer,
}: {
  question: IQuestion;
  qIndex: number;
  getUserAnswer: (questionId: number) => number | undefined;
  isCorrectAnswer: (questionId: number) => boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const userAnswerIndex = getUserAnswer(question.id);
  const isCorrect = isCorrectAnswer(question.id);
  const correctAnswer = question.answers?.find((a) => a.isTrue);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 50, scale: 0.95 }
      }
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
        isCorrect
          ? "border-green-500"
          : userAnswerIndex === undefined
          ? "border-gray-400"
          : "border-red-500"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-start gap-3 mb-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: 0.3, type: "spring" }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            isCorrect
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {qIndex + 1}
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {question.question}
          </h3>
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={
            isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }
          }
          transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          )}
        </motion.div>
      </motion.div>

      <div className="space-y-3">
        {question.answers?.map((answer, aIndex) => {
          const isUserAnswer = userAnswerIndex === aIndex;
          const isCorrectOption = answer.id === correctAnswer?.id;

          return (
            <motion.div
              key={answer.id}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.4, delay: 0.3 + aIndex * 0.1 }}
              className={`p-4 rounded-lg border-2 transition ${
                isCorrectOption
                  ? "bg-green-50 border-green-500"
                  : isUserAnswer && !isCorrect
                  ? "bg-red-50 border-red-500"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.4 + aIndex * 0.1,
                    type: "spring",
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                    isCorrectOption
                      ? "bg-green-500 text-white"
                      : isUserAnswer && !isCorrect
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {String.fromCharCode(65 + aIndex)}
                </motion.div>
                <p
                  className={`flex-1 ${
                    isCorrectOption || (isUserAnswer && !isCorrect)
                      ? "font-semibold"
                      : ""
                  }`}
                >
                  {answer.text}
                </p>
                {isCorrectOption && (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={
                      isInView
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: -90 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + aIndex * 0.1,
                      type: "spring",
                    }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  </motion.div>
                )}
                {isUserAnswer && !isCorrect && (
                  <motion.div
                    initial={{ scale: 0, rotate: 90 }}
                    animate={
                      isInView
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: 90 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + aIndex * 0.1,
                      type: "spring",
                    }}
                  >
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Animated Status Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className={`mt-4 p-3 rounded-lg ${
          isCorrect ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            isCorrect ? "text-green-800" : "text-red-800"
          }`}
        >
          {isCorrect
            ? "✓ Jawaban kamu benar! Hebat!"
            : userAnswerIndex != null && userAnswerIndex >= 0
            ? `✗ Jawaban kamu: ${String.fromCharCode(
                65 + userAnswerIndex
              )} | Jawaban yang benar: ${String.fromCharCode(
                65 +
                  (question.answers?.findIndex((a: IAnswer) => a.isTrue) || 0)
              )}`
            : "❗ Kamu tidak menjawab soal ini"}
        </p>
      </motion.div>
    </motion.div>
  );
}

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
          label: "✓ Mission Complete",
          className: "bg-green-100 text-green-700 border border-green-300",
        },
      }}
    >
      <HeadMetaData title="Quiz Results" />

      <LoadingWithCard
        notification={notification}
        dismissNotification={dismissNotification}
      />

      <div className="px-4 md:px-8 lg:px-32 py-8">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          variants={ANIMATION_VARIANTS.container}
          initial="initial"
          animate="animate"
        >
          <div className="text-center mb-6">
            <motion.div
              className="relative w-32 h-32 mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r bg-blue-700 rounded-full opacity-20 blur-xl" />
              <div className="relative w-full h-full bg-gradient-to-br bg-blue-700 rounded-full flex items-center justify-center shadow-xl">
                <Award className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Mission Complete!
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-gray-600 text-lg"
            >
              {lobby.name}
            </motion.p>
          </div>

          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="text-5xl font-bold text-indigo-600"
              >
                {score}
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.98 }}
                className="text-gray-600"
              >
                Correct
              </motion.p>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-4xl text-gray-400"
            >
              /
            </motion.div>
            <div className="text-center">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="text-5xl font-bold text-gray-700"
              >
                {totalQuestions}
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.98 }}
                className="text-gray-600"
              >
                Questions
              </motion.p>
            </div>
          </div>

          <motion.div
            className="max-w-md mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.98 }}
          >
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.96 }}
              >
                Score
              </motion.span>
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="font-semibold inline-block origin-bottom"
              >
                {percentage.toFixed(1)}%
              </motion.span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  percentage >= 80
                    ? "bg-green-500"
                    : percentage >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 text-center"
          >
            <ButtonQuiz onClick={goBackToLobby}>
              <ChevronLeft className="mr-2" /> Back to Lobby
            </ButtonQuiz>
          </motion.div>
        </motion.div>

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
