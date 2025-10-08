// features/lobby/student/hooks/useLobbySocket.ts

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { getSocket } from '@/utils/socket';
import { LobbyData } from '@/types/lobby';
import { generateUserId, validateLobbyJoin } from '../utils/lobbyHelpers';
import { SOCKET_EVENTS, STORAGE_KEYS } from '../constans/lobbyConstans';

interface UseLobbySocketProps {
  onLobbyUpdate: (lobbies: LobbyData[]) => void;
  onLobbyCreated: (lobby: LobbyData) => void;
  onJoinSuccess: (data: { lobbyId: string; lobbyName: string }) => void;
  onJoinError: (message: string) => void;
  onLobbyDeleted: (lobbyId: string) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onNotification: (message: string) => void;
}

export const useLobbySocket = ({
  onLobbyUpdate,
  onLobbyCreated,
  onJoinSuccess,
  onJoinError,
  onLobbyDeleted,
  onLoadingChange,
  onNotification,
}: UseLobbySocketProps) => {
  const router = useRouter();
  const [socket, setSocket] = useState<any | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  // Use refs to avoid dependency issues
  const callbacksRef = useRef({
    onLobbyUpdate,
    onLobbyCreated,
    onJoinSuccess,
    onJoinError,
    onLobbyDeleted,
    onLoadingChange,
    onNotification,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onLobbyUpdate,
      onLobbyCreated,
      onJoinSuccess,
      onJoinError,
      onLobbyDeleted,
      onLoadingChange,
      onNotification,
    };
  }, [onLobbyUpdate, onLobbyCreated, onJoinSuccess, onJoinError, onLobbyDeleted, onLoadingChange, onNotification]);

  useEffect(() => {
    const id = Cookies.get('user.id') ?? generateUserId();
    setUserId(id);

    const s = getSocket();
    setSocket(s);

    // Check if user was in a lobby and redirect
    const savedLobby = localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY);
    if (savedLobby) {
      router.push(`/lobby/student/${savedLobby}`);
      return;
    }

    s.emit(SOCKET_EVENTS.GET_LOBBIES);

    // Socket event handlers using refs
    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      callbacksRef.current.onLobbyUpdate(updatedLobbies);
      callbacksRef.current.onLoadingChange(false);
    };

    const lobbyCreatedHandler = (newLobby: LobbyData) => {
      callbacksRef.current.onLobbyCreated(newLobby);
      callbacksRef.current.onNotification(`New mission "${newLobby.name}" is available!`);
    };

    const joinSuccessHandler = ({ lobbyId, lobbyName }: any) => {
      setIsJoining(false);
      localStorage.setItem(STORAGE_KEYS.JOINED_LOBBY, lobbyId);
      callbacksRef.current.onJoinSuccess({ lobbyId, lobbyName });
      callbacksRef.current.onNotification(`Successfully joined mission "${lobbyName}"!`);
      router.push(`/lobby/student/${lobbyId}`);
    };

    const joinErrorHandler = ({ message }: any) => {
      console.error('Join error:', message);
      setIsJoining(false);
      callbacksRef.current.onJoinError(message);
      callbacksRef.current.onNotification(message);
    };

    const lobbyDeletedHandler = ({ lobbyId }: any) => {
      callbacksRef.current.onLobbyDeleted(lobbyId);
      if (localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY) === lobbyId) {
        callbacksRef.current.onNotification('The mission has been cancelled by command');
        localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
      }
    };

    const quizStartedHandler = (updatedLobby: any) => {
      const currentLobbyId = localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY);
      if (currentLobbyId === updatedLobby.id) {
        router.push(`/lobby/student/${updatedLobby.id}/start`);
      }
    };

    const quizEndedHandler = ({ lobbyId }: any) => {
      if (localStorage.getItem(STORAGE_KEYS.JOINED_LOBBY) === lobbyId) {
        callbacksRef.current.onNotification('Mission completed. Thank you for your service!');
        localStorage.removeItem(STORAGE_KEYS.JOINED_LOBBY);
      }
      s.emit(SOCKET_EVENTS.GET_LOBBIES);
    };

    // Register event listeners
    s.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
    s.on(SOCKET_EVENTS.LOBBY_CREATED, lobbyCreatedHandler);
    s.on(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);
    s.on(SOCKET_EVENTS.JOIN_ERROR, joinErrorHandler);
    s.on(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
    s.on(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
    s.on(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);

    return () => {
      s.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
      s.off(SOCKET_EVENTS.LOBBY_CREATED, lobbyCreatedHandler);
      s.off(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);
      s.off(SOCKET_EVENTS.JOIN_ERROR, joinErrorHandler);
      s.off(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
      s.off(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
      s.off(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
    };
  }, [router]);

  const joinLobby = useCallback(
    (lobbyId: string, status: string) => {
      if (!socket || isJoining) {
        console.log('❌ Cannot join: socket not ready or already joining');
        return;
      }

      const validation = validateLobbyJoin(status as any);
      if (!validation.canJoin) {
        alert(validation.message);
        return;
      }

      setIsJoining(true);

      socket.emit(SOCKET_EVENTS.JOIN_LOBBY, {
        lobbyId,
        userId,
        username: Cookies.get('user.username') || 'Anonymous',
      });
    },
    [socket, userId, isJoining]
  );

  const refreshLobbies = useCallback(() => {
    if (!socket) return;

    callbacksRef.current.onLoadingChange(true);
    socket.emit(SOCKET_EVENTS.GET_LOBBIES);
    callbacksRef.current.onNotification('Scanning for new lobbies...');

    setTimeout(() => {
      callbacksRef.current.onLoadingChange(false);
    }, 3000);
  }, [socket]);

  return {
    socket,
    userId,
    joinLobby,
    refreshLobbies,
    isJoining,
  };
};