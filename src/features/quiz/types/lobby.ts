import { LobbyData } from "@/types/lobby";

export interface CreateLobbyPayload {
  name: string;
  instructorId: string;
  duration: number;
}

export interface CreateLobbyResponse {
  success: boolean;
  lobby?: LobbyData;
  message?: string;
}

export interface JoinLobbyPayload {
  lobbyId: string;
  userId: string;
  username: string;
}

export interface LeaveLobbyPayload {
  lobbyId: string;
  userId: string;
  username: string;
}

export interface DeleteLobbyPayload {
  lobbyId: string;
  instructorId: string;
}

export interface QuizControlPayload {
  lobbyId: string;
}

export interface UpdateBankPayload {
  lobbyId: string;
  bankId: number;
}
