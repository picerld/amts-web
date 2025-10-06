"use client";

import { useRouter } from "next/router";
import LobbyHeader from "@/features/quiz/components/container/LobbyHeader";
import { useNotification } from "@/features/quiz/context/NotificationContext";
import { InstructorLobbyContainer } from "@/features/quiz/lobby/instructor/pages/InstructorLobbyContainer";
import { trpc } from "@/utils/trpc";
import LoaderWithPlane from "@/features/quiz/components/dialog/LoaderWithPlane";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { BarChart3, Star, Target, Trophy, Users } from "lucide-react";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { useInstructorLobbyRoom } from "@/features/quiz/lobby/instructor/hooks";

export default function InstructorLobbyRoom() {
  const router = useRouter();
  const { lobbyId } = router.query;
  const { showNotif } = useNotification();

  const lobbyIdStr = Array.isArray(lobbyId) ? lobbyId[0] : lobbyId || "";

  const { data: subjects, isLoading: isLoadingSubject } =
    trpc.bank.getAll.useQuery();

  const {
    lobby,
    messages,
    chatInput,
    setChatInput,
    userId,
    isLoading,
    showResultDialog,
    setShowResultDialog,
    sendMessage,
    startQuiz,
    endQuiz,
    deleteLobby,
    leaveLobby,
    updateLobbyBank,
  } = useInstructorLobbyRoom({

    lobbyId: lobbyIdStr,
    onNotification: (title, description) => showNotif({ title, description }),
  });

  if (isLoading) return <LoaderWithPlane title="Loading" />;

  return (
    <LobbyHeader padded={false} backHref="/lobby/instructor" withBack>
      <HeadMetaData title="Instructor Lobby" />

      <InstructorLobbyContainer
        subjects={subjects || []}
        lobby={lobby!}
        messages={messages}
        userId={userId}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendMessage={sendMessage}
        startQuiz={() => startQuiz()}
        endQuiz={() => endQuiz()}
        deleteLobby={() => deleteLobby()}
        leaveLobby={leaveLobby}
        isSubjectLoading={isLoadingSubject}
        updateLobbyBank={(lobbyId, bankId) => updateLobbyBank(lobbyId, bankId)}
      />

      {/* TODO: refactor this */}
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
                Quiz Completed!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 text-lg text-center mt-2">
                Quiz has ended. Here are the results:
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
                    <p className="text-sm text-gray-600">Total Participants</p>
                    <p className="text-3xl font-bold text-blue-600">100</p>
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
                      Student
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
                  <p className="text-gray-600 text-sm">Quiz Duration</p>
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
                className="w-full"
              >
                Close
              </ButtonQuiz>

              <ButtonQuiz
                onClick={() => {
                  setShowResultDialog(false);
                }}
                variant="primary"
                className="w-full"
              >
                Return to Lobby
              </ButtonQuiz>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </LobbyHeader>
  );
}
