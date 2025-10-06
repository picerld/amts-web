import { useState, useMemo } from 'react';
import { LobbyData } from '@/types/lobby';
import { LOBBY_STATUS } from '../constans/lobbyConstans';

export const useLobbyState = () => {
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeLobbies = useMemo(
    () => lobbies.filter((lobby) => lobby.status !== LOBBY_STATUS.FINISHED),
    [lobbies]
  );

  const finishedLobbies = useMemo(
    () => lobbies.filter((lobby) => lobby.status === LOBBY_STATUS.FINISHED),
    [lobbies]
  );

  const showNotification = (msg: string) => {
    setNotification(msg);
  };

  const dismissNotification = () => {
    setNotification('');
  };

  return {
    lobbies,
    setLobbies,
    activeLobbies,
    finishedLobbies,
    isJoining,
    setIsJoining,
    notification,
    showNotification,
    dismissNotification,
    isLoading,
    setIsLoading,
  };
};
