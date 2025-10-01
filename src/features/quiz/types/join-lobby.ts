export interface JoinLobbyValidation {
  canJoin: boolean;
  message?: string;
}

export interface LobbyJoinPayload {
  lobbyId: string;
  userId: string;
  username: string;
}
