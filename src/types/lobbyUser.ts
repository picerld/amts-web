export type LobbyUser = {
    id: string;
    userId: string;
    lobbyId: string;
    joinedAt: Date;
    finished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}