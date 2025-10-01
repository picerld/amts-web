import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, User } from "lucide-react";
import { ChatMessage } from "../../types/chat-message";
import { LobbyData } from "@/types/lobby";
import { ButtonQuiz } from "../ui/button-quiz";
import { InputFieldQuizz } from "../ui/input-field-quizz";

type ChatMessageContainerProps = {
  lobby: LobbyData;
  messages: ChatMessage[];
  userId: string;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
};

export const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({
  lobby,
  messages,
  userId,
  chatInput,
  sendMessage,
  setChatInput,
}) => {
  return (
    <motion.div className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col">
      {/* Chat Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-200 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between gap-3">
          <motion.div className="flex items-center gap-3">
            <motion.div
              className="p-2 bg-white/20 rounded-lg"
              whileHover={{ scale: 1.1 }}
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">Lobby Chats!</h3>
              <p className="text-blue-100 text-sm">
                Secure Channel - End-to-End Encrypted
              </p>
            </div>
          </motion.div>

          <motion.div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              lobby.status === "ONGOING"
                ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {lobby.status}
          </motion.div>
        </div>
      </motion.div>

      {/* Messages */}
      <motion.div
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {messages.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-gray-600 font-semibold mb-2">
              Communication Channel Open
            </h4>
            <p className="text-gray-500 text-sm">
              Waiting for mission communications...
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`${
                  msg.type === "system"
                    ? "text-center"
                    : msg.userId === userId
                    ? "ml-4"
                    : "mr-4"
                }`}
                exit="hidden"
                layout
              >
                {msg.type === "system" ? (
                  <motion.div
                    className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-sm"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span
                      className={`text-sm font-medium ${
                        msg.color === "red" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {msg.message}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className={`max-w-sm ${
                      msg.userId === userId
                        ? "ml-auto bg-blue-600 text-white border border-blue-600"
                        : "bg-white border border-gray-200 text-gray-800"
                    } rounded-xl p-4 shadow-md`}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-semibold opacity-80">
                        {msg.username}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <div className="text-xs opacity-60 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Message Input */}
      <motion.div
        className="border-t border-gray-200 p-6 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex gap-3">
          <InputFieldQuizz
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Chat to the other students ..."
          />
          <ButtonQuiz variant={"primary"} onClick={sendMessage}>
            <Send className="w-4 h-4" />
            Send
          </ButtonQuiz>
        </div>
      </motion.div>
    </motion.div>
  );
};
