"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/router";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import LoadingWithCard from "@/features/quiz/components/dialog/LoadingWithCard";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Trophy, BarChart3, Star, Users, Target } from "lucide-react";
import { useEffect, useState } from "react";
import StudentLobbyContainer from "@/features/quiz/lobby/student/pages/StudentLobbyContainer";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { useStudentLobbyRoom } from "@/features/quiz/lobby/student/hooks";
import { NoQuizScreen } from "@/features/quiz/lobby/student/components/start/NoQuizScreen";

export default function StudentLobbyRoom() {
  const router = useRouter();

  const { lobbyId } = router.query;

  const [notification, setNotification] = useState<string>("");

  const {
    chatInput,
    setChatInput,
    sendMessage,
    isLeaving,
    isLoading,
    loadingError,
    lobby,
    messages,
    leaveLobby,
    showResultDialog,
    setShowResultDialog,
    userId,
  } = useStudentLobbyRoom({
    lobbyId: lobbyId?.toString() ?? "",
    onNotification: setNotification,
  });

  useEffect(() => {
    if (lobby?.status === "ONGOING") {
      router.push(`/lobby/student/${lobbyId}/start`);
    }
  }, [lobby, router, lobbyId]);

  const dismissNotification = () => setNotification("");

  const goBackToLobbyList = () => router.push("/lobby/student");

  if (loadingError) {
    return <NoQuizScreen onReturnToBase={goBackToLobbyList} />;
  }

  if (isLoading)
    return (
      <LoaderWithPlane
        title="Loading mission status..."
        subtitle="Verifying mission parameters"
      />
    );

  return (
    <LobbyHeader
      backHref="/lobby/student"
      status="WAITING"
      title={lobby?.name ?? ""}
      subtitle={`Commander: ${lobby?.instructor?.username || "Unknown"}`}
    >
      <LoadingWithCard
        notification={notification}
        dismissNotification={dismissNotification}
      />

      <StudentLobbyContainer
        lobby={lobby!}
        messages={messages}
        userId={userId}
        chatInput={chatInput}
        isLeaving={isLeaving}
        setChatInput={setChatInput}
        sendMessage={sendMessage}
        leaveLobby={leaveLobby}
      />

      {/* Result Dialog */}
      <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <AlertDialogContent asChild>
          <motion.div
            className="bg-white shadow-2xl border border-gray-200 rounded-3xl p-8 text-gray-900 lg:max-w-6xl overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Header */}
            <AlertDialogHeader className="flex flex-col justify-center items-center">
              <motion.div
                className="p-6 bg-blue-600 rounded-full mb-4 shadow-md"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
              <AlertDialogTitle className="text-4xl font-bold text-gray-800 text-center">
                Mission Complete!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 text-lg text-center mt-2">
                The mission has ended. Here are the results:
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Body */}
            <motion.div
              className="py-6 space-y-6 grid grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Overview */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-xl mb-4 text-blue-700 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Overview
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Total Cadets</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {lobby?._count?.LobbyUser || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-xl mb-4 text-green-700 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  Top Performers
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Cadet
                    </span>
                    <span className="font-bold text-green-600">100 pts</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 shadow-sm col-span-2">
                <h3 className="font-semibold text-xl mb-4 text-purple-700 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Statistics
                </h3>
                <div>
                  <p className="text-gray-600 text-sm">Mission Duration</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {lobby?.duration ? `${lobby.duration} min` : "N/A"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <AlertDialogFooter className="flex justify-end gap-4 mt-6">
              <ButtonQuiz
                onClick={() => setShowResultDialog(false)}
                variant="abort"
              >
                Close
              </ButtonQuiz>

              <ButtonQuiz
                onClick={() => {
                  setShowResultDialog(false);
                  router.push("/lobby/student");
                }}
                variant="softPrimary"
              >
                Return to Lobby List
              </ButtonQuiz>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </LobbyHeader>
  );
}
