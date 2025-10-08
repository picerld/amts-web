"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Flag,
  Star,
} from "lucide-react";
import { IQuestion } from "@/types/question";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { QuizConfirmDialog } from "@/features/quiz/components/container/QuizConfirmDialog";
import { STORAGE_KEYS } from "@/features/quiz/constans/lobbyConstans";

interface QuestionsPanelProps {
  questions: IQuestion[];
  lobbyId: string;
  answeredCount: number;
  score: number;
  selectedAnswers: { questionId: number; answerId: number | null }[];
  onReset: () => void;
  onSubmit?: () => void;
  handleReset: () => void;
  handleAnswer: (questionIndex: number, answerIndex: number) => void;
}

export const QuestionsPanel = ({
  questions,
  lobbyId,
  answeredCount,
  selectedAnswers,
  onReset,
  onSubmit,
  score,
  handleReset,
  handleAnswer,
}: QuestionsPanelProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const optionLabels = ["A", "B", "C", "D"];

  const getCorrectAnswerIndex = (question: IQuestion) => {
    return question.answers?.findIndex((answer) => answer.isTrue) ?? -1;
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const goToQuestion = (index: number) => setCurrentQuestionIndex(index);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Sidebar - Question Navigator */}
      <motion.div
        className="lg:col-span-3"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-800 text-lg">Daftar Soal</h3>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-6">
            {questions.map((question, index) => {
              const isAnswered = selectedAnswers.some(
                (a) => a.questionId === question.id
              );
              const isCurrent = index === currentQuestionIndex;

              return (
                <motion.button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`aspect-square rounded-xl font-bold text-lg transition-all relative overflow-hidden cursor-pointer ${
                    isCurrent
                      ? "bg-blue-600 text-white scale-110 shadow-lg"
                      : isAnswered
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  whileHover={{ scale: isCurrent ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isAnswered && !isCurrent && (
                    <Check className="absolute top-1 right-1 w-4 h-4" />
                  )}
                  {index + 1}
                </motion.button>
              );
            })}
          </div>

          {/* Progress Section */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm font-medium">Progres</span>
              <span className="text-blue-600 font-bold">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(answeredCount / totalQuestions) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {answeredCount === totalQuestions && (
              <motion.div
                className="bg-green-50 border border-green-200 rounded-lg p-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 text-sm font-medium">
                    Estimasi Skor
                  </span>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {score}/{totalQuestions}
                </div>
              </motion.div>
            )}

            <QuizConfirmDialog
              mode="light"
              trigger={
                <ButtonQuiz variant="abort" className="w-full">
                  Reset Semua
                </ButtonQuiz>
              }
              onConfirm={() => {
                handleReset;
                localStorage.removeItem(
                  `${STORAGE_KEYS.QUIZ_PROGRESS}:${lobbyId}`
                );
                onReset();
              }}
              title="Reset Semua Jawaban?"
              description="Anda yakin ingin mereset semua jawaban?"
              confirmText="Ya, Reset"
              cancelText="Tidak, Batal"
            />

            {onSubmit && answeredCount === totalQuestions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <ButtonQuiz
                  onClick={onSubmit}
                  variant="primary"
                  className="w-full"
                >
                  <Flag className="w-4 h-4 mr-2 inline" />
                  Submit Quiz
                </ButtonQuiz>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Question Area */}
      <div className="lg:col-span-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-200"
            initial={{ x: 100, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -100, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question Header with Progress Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                    <span className="text-white font-bold">
                      Soal {currentQuestionIndex + 1} dari {totalQuestions}
                    </span>
                  </div>
                  {selectedAnswers[currentQuestionIndex] !== undefined && (
                    <motion.div
                      className="bg-green-400/20 backdrop-blur-sm border border-green-300/50 px-3 py-1 rounded-lg flex items-center gap-2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                    >
                      <Check className="w-4 h-4 text-green-100" />
                      <span className="text-sm font-semibold text-white">
                        Terjawab
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="text-white font-medium">
                  {Math.round((answeredCount / totalQuestions) * 100)}% Selesai
                </div>
              </div>

              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      ((currentQuestionIndex + 1) / totalQuestions) * 100
                    }%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question & Options */}
            <div className="p-8">
              <motion.div
                className="mb-8 bg-blue-50 rounded-xl p-6 border border-blue-100"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.answers?.map((answer, answerIndex) => {
                  const isSelected = selectedAnswers.some(
                    (a) =>
                      a.questionId === currentQuestion.id &&
                      a.answerId === answer.id
                  );

                  return (
                    <motion.button
                      key={answer.id}
                      onClick={() =>
                        handleAnswer(currentQuestion.id, answer.id)
                      }
                      className={`group relative p-6 rounded-2xl text-left transition-all border-2 cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + answerIndex * 0.05 }}
                      whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-gray-100 text-gray-700 group-hover:bg-blue-100"
                          }`}
                        >
                          {optionLabels[answerIndex]}
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 bg-white/20 rounded-xl"
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.2, 1] }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </div>
                        <span className="font-medium text-gray-800 text-lg">
                          {answer.text} {answer.isTrue && " (Benar)"}
                        </span>
                      </div>

                      {isSelected && (
                        <motion.div
                          className="absolute top-3 right-3"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                        >
                          <div className="bg-blue-500 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                <ButtonQuiz
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="secondaryGray"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Sebelumnya
                </ButtonQuiz>

                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-gray-600 font-medium">
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </span>
                </div>

                <ButtonQuiz
                  onClick={handleNext}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  Selanjutnya
                  <ChevronRight className="w-5 h-5" />
                </ButtonQuiz>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
