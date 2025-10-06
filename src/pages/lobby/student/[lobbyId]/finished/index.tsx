"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useStudentLobbyFinished } from "@/features/quiz/lobby/student/hooks/useStudentLobbyFinished";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import { NoQuizScreen } from "@/features/quiz/lobby/student/components/start/NoQuizScreen";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import LoadingWithCard from "@/features/quiz/components/dialog/LoadingWithCard";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { CheckCircle2, XCircle, Award, ArrowLeft } from "lucide-react";

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
        {/* Header with Score */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Mission Complete!
            </h1>
            <p className="text-gray-600 text-lg">{lobby.name}</p>
          </div>

          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-indigo-600">{score}</p>
              <p className="text-gray-600">Correct</p>
            </div>
            <div className="text-4xl text-gray-400">/</div>
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-700">
                {totalQuestions}
              </p>
              <p className="text-gray-600">Questions</p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Score</span>
              <span className="font-semibold">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  percentage >= 80
                    ? "bg-green-500"
                    : percentage >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={goBackToLobby}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Lobby
            </button>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Review Answers
          </h2>

          {questions.map((question, qIndex) => {
            const userAnswerIndex = getUserAnswer(question.id);
            const isCorrect = isCorrectAnswer(question.id);
            const correctAnswer = question.answers?.find((a) => a.isTrue);

            return (
              <div
                key={question.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                  isCorrect ? "border-green-500" : "border-red-500"
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCorrect
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {qIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {question.question}
                    </h3>
                  </div>
                  {isCorrect ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  )}
                </div>

                {/* Answers */}
                <div className="space-y-3">
                  {question.answers?.map((answer, aIndex) => {
                    const isUserAnswer = userAnswerIndex === aIndex;
                    const isCorrectOption = answer.id === correctAnswer?.id;

                    return (
                      <div
                        key={answer.id}
                        className={`p-4 rounded-lg border-2 transition ${
                          isCorrectOption
                            ? "bg-green-50 border-green-500"
                            : isUserAnswer && !isCorrect
                            ? "bg-red-50 border-red-500"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                              isCorrectOption
                                ? "bg-green-500 text-white"
                                : isUserAnswer && !isCorrect
                                ? "bg-red-500 text-white"
                                : "bg-gray-300 text-gray-700"
                            }`}
                          >
                            {String.fromCharCode(65 + aIndex)}
                          </div>
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
                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                          )}
                          {isUserAnswer && !isCorrect && (
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Message */}
                <div
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
                      ? "✓ Correct! Great job!"
                      : userAnswerIndex !== undefined
                      ? `✗ Your answer: ${String.fromCharCode(
                          65 + userAnswerIndex
                        )} | Correct answer: ${String.fromCharCode(
                          65 +
                            (question.answers?.findIndex((a) => a.isTrue) || 0)
                        )}`
                      : "✗ No answer provided"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={goBackToLobby}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2 mx-auto shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Lobby
          </button>
        </div>
      </div>
    </LobbyHeader>
  );
}
