import { QuizConfirmDialog } from "@/features/quiz/components/container/QuizConfirmDialog";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { ANIMATION_VARIANTS } from "@/features/quiz/constans/lobbyConstans";
import { LobbyData } from "@/types/lobby";
import { motion } from "framer-motion";
import { Clock, LogOut, Target, Users } from "lucide-react";

type StudentMissionInformationProps = {
  lobby: LobbyData;
  isLeaving: boolean;
  leaveLobby: () => void;
};

export const StudentMissionInformation: React.FC<
  StudentMissionInformationProps
> = ({ lobby, isLeaving, leaveLobby }) => {
  return (
    <motion.div
      className="lg:col-span-1"
      variants={ANIMATION_VARIANTS.container}
    >
      <motion.div
        className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl"
        variants={ANIMATION_VARIANTS.item}
      >
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
              <span className="text-sm font-medium">Active Cadets</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {lobby?._count?.LobbyUser || 0}
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
              {lobby?.duration}m
            </span>
          </motion.div>

          <motion.div
            className="bg-gray-50 border border-gray-200 rounded-xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="text-gray-800 font-semibold mb-2">Mission ID</h4>
            <p className="text-gray-600 text-sm font-mono">
              {lobby?.id.slice(-12).toUpperCase()}
            </p>
          </motion.div>
        </div>

        <QuizConfirmDialog
          trigger={
            <ButtonQuiz
              variant={"abort"}
              disabled={isLeaving}
              className="w-full mt-5"
            >
              <LogOut className="w-4 h-4" />
              {isLeaving ? "Aborting..." : "Abort Mission"}
            </ButtonQuiz>
          }
          title="Confirm Abort"
          description="Are you sure you want to abort this mission?"
          confirmText="Yes, Abort!"
          cancelText="No, Cancel!"
          onConfirm={leaveLobby}
        />
      </motion.div>
    </motion.div>
  );
};
