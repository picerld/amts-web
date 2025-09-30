export type ChatMessage = {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type?: "chat" | "system";
  color?: "red" | "green";
};
