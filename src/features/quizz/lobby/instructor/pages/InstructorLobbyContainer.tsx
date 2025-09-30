"use client";

import { motion } from "motion/react";
import { containerVariants } from "../components/InstructorLobbyList";
import {
  CheckCircle,
  Clock,
  Expand,
  LogOut,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { LobbyData } from "@/types/lobby";
import { ChatMessage } from "../../../types/chat-message";
import { ButtonQuiz } from "@/features/quizz/components/ui/button-quiz";
import { QuizConfirmDialog } from "@/features/quizz/components/container/QuizConfirmDialog";
import { ChatMessageContainer } from "@/features/quizz/components/container/ChatMessageContainer";
import { IBank } from "@/types/bank";
import { useEffect, useState } from "react";
import { useNotification } from "@/features/quizz/context/NotificationContext";
import { SubjectPicker } from "../components/SubjectPicker";
import QuizTimeDurationCard from "../components/QuizTimeDurationCard";

type InstructorLobbyContainerProps = {
  subjects: IBank[];
  lobby: LobbyData;
  messages: ChatMessage[];
  userId: string;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
  startQuiz: (lobbyId: string) => void;
  endQuiz: (lobbyId: string) => void;
  deleteLobby: (lobbyId: string) => void;
  leaveLobby: () => void;
  isSubjectLoading: boolean;
  updateLobbyBank: (lobbyId: string, bankId: number) => void;
};

export const InstructorLobbyContainer: React.FC<
  InstructorLobbyContainerProps
> = ({
  subjects,
  lobby,
  messages,
  userId,
  chatInput,
  setChatInput,
  sendMessage,
  startQuiz,
  endQuiz,
  deleteLobby,
  leaveLobby,
  isSubjectLoading,
  updateLobbyBank,
}) => {
  const { showNotif } = useNotification();

  const [selectedBankId, setSelectedBankId] = useState<number | null>(
    lobby.bankId || null
  );

  useEffect(() => {
    if (lobby.bankId) {
      setSelectedBankId(lobby.bankId);
    }
  }, [lobby.bankId]);

  const handleSubjectSelect = (bankId: number) => {
    if (lobby.status !== "WAITING") {
      showNotif({
        title: "Oops!",
        description: "You can't change the subject now.",
      });
      return;
    }

    setSelectedBankId(bankId);
    updateLobbyBank(lobby.id, bankId);
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8 pt-10">
      <div className="flex flex-col gap-5">
        <motion.div
          className="lg:col-span-1"
          variants={containerVariants}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        >
          <SubjectPicker
            subjects={subjects}
            selectedBankId={selectedBankId}
            handleSubjectSelect={handleSubjectSelect}
            isSubjectLoading={isSubjectLoading}
          />
        </motion.div>

        <motion.div
          className="lg:col-span-1"
          variants={containerVariants}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        >
          <motion.div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Mission Details
            </h3>

            <div className="space-y-4">
              <motion.div
                className="bg-blue-50 border border-blue-100 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {lobby._count?.LobbyUser || 0}
                </span>
              </motion.div>

              <motion.div
                className="bg-blue-50 border border-blue-100 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {lobby.duration}m
                </span>
              </motion.div>

              <motion.div
                className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="text-gray-800 font-semibold mb-2">Mission ID</h4>
                <p className="text-gray-600 text-sm font-mono">
                  {lobby?.id ? lobby.id.slice(-12).toUpperCase() : "UNKNOWN"}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="lg:col-span-2"
        variants={containerVariants}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ChatMessageContainer
          messages={messages}
          userId={userId}
          lobby={lobby}
          chatInput={chatInput}
          setChatInput={setChatInput}
          sendMessage={sendMessage}
        />
      </motion.div>

      <motion.div
        className="lg:col-span-1"
        variants={containerVariants}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <QuizTimeDurationCard
          duration={lobby.duration}
          startTime={lobby.startTime?.toString() || ""}
          status={lobby.status}
          onExpired={() => {
            showNotif({
              title: "Time's Up!",
              description: "The quiz will end automatically in 5 seconds.",
            });
            setTimeout(() => endQuiz(lobby.id), 5000);
          }}
        />

        <motion.div
          className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Expand className="w-5 h-5 text-blue-600" />
            Mission Actions
          </h3>

          {lobby.status == "WAITING" && (
            <>
              <ButtonQuiz
                variant={"start"}
                onClick={() => startQuiz(lobby.id)}
                className="w-full mt-5"
                disabled={!selectedBankId}
              >
                <Target className="w-5 h-5" />
                {selectedBankId ? "Start Mission" : "Select Subject First"}
              </ButtonQuiz>

              <QuizConfirmDialog
                trigger={
                  <ButtonQuiz variant={"abort"} className="w-full mt-5">
                    <LogOut className="w-4 h-4" />
                    Leave Lobby
                  </ButtonQuiz>
                }
                title="Confirm Leave Lobby"
                description="Are you sure you want to leave this lobby?"
                confirmText="Yes, Leave!"
                cancelText="No, Cancel!"
                onConfirm={leaveLobby}
              />
            </>
          )}

          {lobby.status == "ONGOING" && (
            <QuizConfirmDialog
              trigger={
                <ButtonQuiz variant={"softPrimary"} className="w-full mt-5">
                  <Target className="w-5 h-5" /> End Mission
                </ButtonQuiz>
              }
              title="Wait a moment!"
              description="Are you sure you want to end this quiz before time's up?"
              confirmText="Yes, End Now!"
              cancelText="No, Cancel!"
              onConfirm={() => endQuiz(lobby.id)}
            />
          )}

          {lobby.status === "FINISHED" && (
            <div className="flex flex-col gap-5 mt-5">
              <ButtonQuiz variant={"start"} disabled>
                <CheckCircle className="w-5 h-5" /> Completed
              </ButtonQuiz>

              <QuizConfirmDialog
                trigger={
                  <ButtonQuiz variant={"abort"}>
                    <Shield className="w-5 h-5" /> Delete
                  </ButtonQuiz>
                }
                title="Confirm Delete"
                description="Are you sure you want to delete this lobby?"
                confirmText="Yes, Delete!"
                cancelText="No, Cancel!"
                onConfirm={() => deleteLobby(lobby.id)}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
