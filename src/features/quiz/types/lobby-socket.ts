import { LobbyData } from "@/types/lobby";

export interface LobbySocketCallbacks {
  onLobbyUpdate: (lobbies: LobbyData[]) => void;
  onLobbyCreated: (lobby: LobbyData) => void;
  onJoinSuccess: (data: { lobbyId: string; lobbyName: string }) => void;
  onJoinError: (message: string) => void;
  onLobbyDeleted: (lobbyId: string) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onNotification: (message: string) => void;
}
