"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useCountdown } from "@/features/quiz/hooks/useCountdown";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import { useStudentLobbyQuizStart } from "@/features/quiz/lobby/student/hooks/useStudentLobbyQuizStart";
import { QuizCompletion } from "@/features/quiz/lobby/student/components/start/QuizCompletion";
import { MissionStatusCard } from "@/features/quiz/lobby/student/components/start/MissionStatusCard";
import { QuestionsPanel } from "@/features/quiz/lobby/student/components/start/QuestionPanel";
import { NoQuizScreen } from "@/features/quiz/lobby/student/components/start/NoQuizScreen";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import LoadingWithCard from "@/features/quiz/components/dialog/LoadingWithCard";

export default function StudentQuizStart() {
  const router = useRouter();
  const { lobbyId } = router.query;

  const [notification, setNotification] = useState<string>("");
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});

  const {
    currentQuiz,
    isLoading,
    loadingError,
    lobby,
    setShowResultDialog,
    showResultDialog,
    userId,
  } = useStudentLobbyQuizStart({
    lobbyId: lobbyId?.toString() ?? "",
    onNotification: setNotification,
  });

  const { formattedTime } = useCountdown(
    currentQuiz?.duration || 0,
    currentQuiz?.startTime?.toString() || undefined,
    currentQuiz?.status === "ONGOING"
  );

  const goBackToLobbyList = () => router.push("/lobby/student");

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleReset = () => setSelectedAnswers({});

  const dismissNotification = () => setNotification("");

  if (loadingError) {
    return <NoQuizScreen onReturnToBase={goBackToLobbyList} />;
  }

  if (isLoading) {
    return (
      <LoaderWithPlane
        title="Loading mission status..."
        subtitle="Verifying mission parameters"
      />
    );
  }

  if (currentQuiz && formattedTime === "00:00:00") {
    return (
      <QuizCompletion
        quizName={currentQuiz.name}
        onReturnToBase={goBackToLobbyList}
      />
    );
  }

  if (currentQuiz) {
    return (
      <LobbyHeader>
        <LoadingWithCard
          notification={notification}
          dismissNotification={dismissNotification}
        />
        <div className="flex items-center justify-center gap-5">
          <MissionStatusCard
            quizName={currentQuiz.name}
            formattedTime={formattedTime}
          />

          {currentQuiz.bank?.questions && (
            <QuestionsPanel
              questions={currentQuiz.bank.questions}
              selectedAnswers={selectedAnswers}
              onSelectAnswer={handleSelectAnswer}
              onReset={handleReset}
            />
          )}
        </div>
      </LobbyHeader>
    );
  }

  return <NoQuizScreen onReturnToBase={goBackToLobbyList} />;
}
