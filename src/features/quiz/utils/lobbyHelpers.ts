import { LobbyData } from '@/types/lobby';
import { LOBBY_STATUS, LobbyStatus } from '../constans/lobbyConstans';
import { JoinLobbyValidation } from '../types/join-lobby';

export const getStatusBadgeClass = (status: LobbyStatus): string => {
  switch (status) {
    case LOBBY_STATUS.ONGOING:
      return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    case LOBBY_STATUS.FINISHED:
      return 'bg-green-100 text-green-700 border border-green-300';
    case LOBBY_STATUS.WAITING:
    default:
      return 'bg-green-100 text-green-700 border border-green-300';
  }
};

export const generateUserId = (): string => {
  return `student-${Math.floor(Math.random() * 1000)}`;
};

export const generateInstructorId = (): string => {
  return `instructor-${Math.floor(Math.random() * 1000)}`;
};

export const validateLobbyCreation = (
  name: string,
  duration: number
): { isValid: boolean; message?: string } => {
  if (!name.trim()) {
    return {
      isValid: false,
      message: 'Lobby name is required',
    };
  }

  if (duration <= 0) {
    return {
      isValid: false,
      message: 'Duration must be greater than 0',
    };
  }

  return { isValid: true };
};

export const canStartQuiz = (status: string): boolean => {
  return status === 'WAITING';
};

export const canEndQuiz = (status: string): boolean => {
  return status === 'ONGOING';
};

export const sortLobbies = (lobbies: LobbyData[]): LobbyData[] => {
  return [...lobbies].sort((a, b) => {
    const statusDiff = a.status.localeCompare(b.status);
    if (statusDiff !== 0) return statusDiff;

    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return bDate - aDate;
  });
};

export const validateLobbyJoin = (status: LobbyStatus): JoinLobbyValidation => {
  if (status === LOBBY_STATUS.FINISHED) {
    return {
      canJoin: false,
      message: 'This mission has already ended. You cannot join.',
    };
  }

  if (status === LOBBY_STATUS.ONGOING) {
    return {
      canJoin: false,
      message: 'This mission has already started. You cannot join.',
    };
  }

  return { canJoin: true };
};

export const formatLobbyId = (id: string): string => {
  return id.slice(-8).toUpperCase();
};
