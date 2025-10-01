import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";
import { ANIMATION_VARIANTS } from "@/features/quiz/constans/lobbyConstans";
import { LobbyData } from "@/types/lobby";
import { motion } from "framer-motion";
import { Radar, RefreshCw, Target } from "lucide-react";
import StudentLobbyCard from "./StudentLobbyCard";

type StudentLobbyListProps = {
  lobbies: LobbyData[];
  isJoining: string | null;
  joinLobby: (lobbyId: string, status: string) => void;
  onRefresh: () => void;
};

export const StudentLobbyList: React.FC<StudentLobbyListProps> = ({
  lobbies,
  isJoining,
  joinLobby,
  onRefresh,
}) => {
  return (
    <motion.div className="px-10" variants={ANIMATION_VARIANTS.container}>
      {lobbies.length === 0 ? (
        <motion.div
          className="text-center py-16"
          variants={ANIMATION_VARIANTS.item}
        >
          <div className="mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "linear",
              }}
            >
              <Radar className="w-24 h-24 text-blue-300 mx-auto mb-6 opacity-50" />
            </motion.div>
            <motion.h3
              className="text-2xl font-bold text-gray-800 mb-2"
              variants={ANIMATION_VARIANTS.item}
            >
              No Active Missions
            </motion.h3>
            <motion.p
              className="text-blue-600 mb-6"
              variants={ANIMATION_VARIANTS.item}
            >
              Waiting for command to deploy training missions
            </motion.p>
            <motion.button
              onClick={onRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={ANIMATION_VARIANTS.item}
            >
              <RefreshCw className="w-5 h-5" />
              Scan Again
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-6"
          variants={ANIMATION_VARIANTS.container}
        >
          <motion.div
            className="flex items-center justify-between"
            variants={ANIMATION_VARIANTS.item}
          >
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              Available Missions
            </h2>
            <ButtonQuiz
              variant={"secondary"}
              onClick={onRefresh}
              className="text-blue-600 hover:bg-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </ButtonQuiz>
          </motion.div>

          <motion.div
            className="grid gap-6"
            variants={ANIMATION_VARIANTS.container}
          >
            {lobbies
              .filter((lobby) => lobby.status !== "FINISHED")
              .map((lobby, index) => (
                <StudentLobbyCard
                  key={lobby.id}
                  lobby={lobby}
                  index={index}
                  isJoining={isJoining}
                  joinLobby={joinLobby}
                />
              ))}
          </motion.div>

          {/* Finished Missions */}
          {lobbies.filter((lobby) => lobby.status === "FINISHED").length >
            0 && (
            <>
              <motion.div
                className="flex items-center justify-between mt-12"
                variants={ANIMATION_VARIANTS.item}
              >
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Target className="w-6 h-6 text-gray-600" />
                  Completed Missions
                </h2>
              </motion.div>

              <motion.div
                className="grid gap-6"
                variants={ANIMATION_VARIANTS.container}
              >
                {lobbies
                  .filter((lobby) => lobby.status === "FINISHED")
                  .map((lobby, index) => (
                    <StudentLobbyCard
                      key={lobby.id}
                      lobby={lobby}
                      index={index}
                      isJoining={isJoining}
                      joinLobby={joinLobby}
                    />
                  ))}
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
