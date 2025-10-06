"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useCountdown } from "@/features/quiz/hooks/useCountdown";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import { useStudentLobbyQuizStart } from "@/features/quiz/lobby/student/hooks/useStudentLobbyQuizStart";
import { QuizCompletion } from "@/features/quiz/lobby/student/components/start/QuizCompletion";
import { MissionStatusCard } from "@/features/quiz/lobby/student/components/start/MissionStatusCard";
import { QuestionsPanel } from "@/features/quiz/lobby/student/components/start/QuestionPanel";
import { QuizResultsDialog } from "@/features/quiz/lobby/student/components/start/QuizResultsDialog";
import { ConfirmationDialog } from "@/features/quiz/lobby/student/components/start/ConfirmationDialog";
import { NoQuizScreen } from "@/features/quiz/lobby/student/components/start/NoQuizScreen";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import LoadingWithCard from "@/features/quiz/components/dialog/LoadingWithCard";
import { HeadMetaData } from "@/components/meta/HeadMetaData";

export default function StudentQuizStart() {
  const router = useRouter();
  const { lobbyId } = router.query;

  const [notification, setNotification] = useState<string>("");
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const handleSubmitClick = () => {
    // Tampilkan dialog konfirmasi
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    // Setelah konfirmasi, tampilkan hasil
    setShowResultsDialog(true);
  };

  const calculateScore = () => {
    if (!currentQuiz?.bank?.questions) return 0;
    return currentQuiz.bank.questions.reduce((score, question, qIndex) => {
      const correctIndex =
        question.answers?.findIndex((answer) => answer.isTrue) ?? -1;
      return score + (selectedAnswers[qIndex] === correctIndex ? 1 : 0);
    }, 0);
  };

  const getConfirmationMessage = () => {
    const totalQuestions = currentQuiz?.bank?.questions?.length || 0;
    const answeredCount = Object.keys(selectedAnswers).length;
    const unansweredCount = totalQuestions - answeredCount;

    if (answeredCount === totalQuestions) {
      return {
        title: "Konfirmasi Submit",
        message: `Anda yakin ingin submit semua jawaban? Setelah submit, Anda tidak bisa mengubah jawaban lagi.`,
        type: "info" as const,
      };
    } else {
      return {
        title: "Peringatan!",
        message: `Anda masih memiliki ${unansweredCount} soal yang belum dijawab. Apakah Anda yakin ingin submit sekarang? Soal yang tidak dijawab akan dianggap salah.`,
        type: "warning" as const,
      };
    }
  };

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
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = currentQuiz.bank?.questions?.length || 0;
    const confirmMessage = getConfirmationMessage();

    return (
      <LobbyHeader
        padded={false}
        status="ONGOING"
        statusConfig={{
          ONGOING: {
            label: "🔴 Live Exercise",
            className: "bg-red-100 text-red-700 border border-red-300",
            animated: true,
          },
        }}
      >
        <HeadMetaData title="Quiz Start" />

        <div className="px-32">
          <LoadingWithCard
            notification={notification}
            dismissNotification={dismissNotification}
          />

          <div className="mb-6">
            <MissionStatusCard
              quizName={currentQuiz.name}
              formattedTime={formattedTime}
              onSubmit={handleSubmitClick}
              answeredCount={answeredCount}
              totalQuestions={totalQuestions}
            />
          </div>

          {currentQuiz.bank?.questions && (
            <QuestionsPanel
              questions={currentQuiz.bank.questions}
              selectedAnswers={selectedAnswers}
              onSelectAnswer={handleSelectAnswer}
              onReset={handleReset}
              onSubmit={handleSubmitClick}
            />
          )}

          <ConfirmationDialog
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={handleConfirmSubmit}
            title={confirmMessage.title}
            message={confirmMessage.message}
            type={confirmMessage.type}
            confirmText="Ya, Submit"
            cancelText="Batal"
          />

          <QuizResultsDialog
            isOpen={showResultsDialog}
            onClose={() => setShowResultsDialog(false)}
            score={calculateScore()}
            totalQuestions={totalQuestions}
            quizName={currentQuiz.name}
            onReturnToLobby={goBackToLobbyList}
          />
        </div>
      </LobbyHeader>
    );
  }

  return <NoQuizScreen onReturnToBase={goBackToLobbyList} />;
}
