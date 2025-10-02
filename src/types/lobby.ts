import { IBank } from "./bank";
import { User } from "./user";

export type LobbyData = {
    id: string;
    name: string;
    instructorId?: string;
    duration: number;
    status: string;
    _count?: { LobbyUser: number };
    LobbyUser?: number[];
    bankId?: number;
    bank?: IBank;
    instructor?: User
    startTime?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}