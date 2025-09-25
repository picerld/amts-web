export type LobbyData = {
    id: string;
    name: string;
    instructorId: string;
    duration: number;
    status: string;
    _count: { LobbyUser: number };
    LobbyUser?: number[];
    bankId?: number;
    startTime?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}