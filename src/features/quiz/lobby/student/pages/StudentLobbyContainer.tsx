import { motion } from "framer-motion";
import { LobbyData } from "@/types/lobby";
import { ChatMessage } from "@/features/quiz/types/chat-message";
import { ANIMATION_VARIANTS } from "@/features/quiz/constans/lobbyConstans";
import { ChatMessageContainer } from "@/features/quiz/components/container/ChatMessageContainer";
import { StudentMissionInformation } from "../components/StudentMissionInformation";

interface StudentLobbyContainerProps {
  lobby: LobbyData;
  messages: ChatMessage[];
  userId: string;
  chatInput: string;
  isLeaving: boolean;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
  leaveLobby: () => void;
}

export default function StudentLobbyContainer({
  lobby,
  messages,
  userId,
  chatInput,
  isLeaving,
  setChatInput,
  sendMessage,
  leaveLobby,
}: StudentLobbyContainerProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <StudentMissionInformation
        lobby={lobby}
        isLeaving={isLeaving}
        leaveLobby={leaveLobby}
      />

      <motion.div
        className="lg:col-span-2"
        variants={ANIMATION_VARIANTS.container}
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
    </div>
  );
}
