import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getSocket } from '@/utils/socket';
import { LobbyData } from '@/types/lobby';
import { generateInstructorId, sortLobbies } from '@/features/quiz/utils/lobbyHelpers';
import { SOCKET_EVENTS, STORAGE_KEYS } from '@/features/quiz/constans/lobbyConstans';

interface UseInstructorLobbyListProps {
  onNotification: (title: string, description: string) => void;
}

export const useInstructorLobbyList = ({
  onNotification,
}: UseInstructorLobbyListProps) => {
  const router = useRouter();
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [isJoining, setIsJoining] = useState<string[]>([]);
  const instructorId = Cookies.get('user.id') ?? generateInstructorId();

  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    const s = getSocket();

    s.emit(SOCKET_EVENTS.GET_LOBBIES);

    const lobbyUpdatedHandler = (updatedLobbies: LobbyData[]) => {
      setLobbies(updatedLobbies.filter((l) => l.instructor?.id == instructorId));
    };

    const quizStartedHandler = (startedLobby: LobbyData) => {
      if (startedLobby.instructorId === instructorId) {
        setLobbies((prev) =>
          prev.map((l) =>
            l.id === startedLobby.id ? { ...l, status: 'ONGOING' } : l
          )
        );
      }
    };

    const quizEndedHandler = ({ lobbyId }: { lobbyId: string }) => {
      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.id === lobbyId ? { ...lobby, status: 'FINISHED' } : lobby
        )
      );
    };

    const lobbyDeletedHandler = ({ lobbyId }: { lobbyId: string }) => {
      setLobbies((prev) => prev.filter((l) => l.id !== lobbyId));
    };

    const lobbyCreatedHandler = (createdLobby: LobbyData) => {
      if (createdLobby.instructorId === instructorId) {
        setLobbies((prev) => [...prev, createdLobby]);
      }
    };

    const joinSuccessHandler = ({ lobbyId }: { lobbyId: string }) => {
      setIsJoining((prev) => prev.filter((id) => id !== lobbyId));
      localStorage.setItem(STORAGE_KEYS.JOINED_LOBBY, lobbyId);
      router.push(`/lobby/instructor/${lobbyId}`);
    };

    s.on(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
    s.on(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
    s.on(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
    s.on(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
    s.on(SOCKET_EVENTS.LOBBY_CREATED, lobbyCreatedHandler);
    s.on(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);

    return () => {
      s.off(SOCKET_EVENTS.LOBBY_UPDATED, lobbyUpdatedHandler);
      s.off(SOCKET_EVENTS.QUIZ_STARTED, quizStartedHandler);
      s.off(SOCKET_EVENTS.QUIZ_ENDED, quizEndedHandler);
      s.off(SOCKET_EVENTS.LOBBY_DELETED, lobbyDeletedHandler);
      s.off(SOCKET_EVENTS.LOBBY_CREATED, lobbyCreatedHandler);
      s.off(SOCKET_EVENTS.JOIN_SUCCESS, joinSuccessHandler);
    };
  }, [instructorId, router]);

  const createLobby = (
    name: string,
    duration: number,
    onSuccess: (lobby: LobbyData) => void,
    onError: (message: string) => void
  ) => {
    const s = getSocket();
    if (!s) return;

    s.emit(
      SOCKET_EVENTS.CREATE_LOBBY,
      { name, instructorId, duration },
      (response: any) => {
        if (response.success && response.lobby) {
          onSuccess(response.lobby);
        } else {
          onError(response.message || 'Failed to create lobby');
        }
      }
    );
  };

  const joinLobby = (lobbyId: string, status: string) => {
    const s = getSocket();

    if (isJoining.includes(lobbyId)) {
      router.push(`/lobby/instructor/${lobbyId}`);
      return;
    }

    if (status === 'FINISHED') {
      alert('This mission has already ended. You cannot join.');
      return;
    }

    if (status === 'ONGOING') {
      alert('This mission has already started. You cannot join.');
      return;
    }

    setIsJoining((prev) => [...prev, lobbyId]);

    s.emit(SOCKET_EVENTS.JOIN_LOBBY, {
      lobbyId,
      userId: instructorId,
      username: Cookies.get('user.username') || 'Anonymous',
    });
  };

  const startQuiz = (lobbyId: string) => {
    const s = getSocket();
    if (s) s.emit(SOCKET_EVENTS.START_QUIZ, { lobbyId });
  };

  const endQuiz = (lobbyId: string) => {
    const s = getSocket();
    if (s) s.emit(SOCKET_EVENTS.END_QUIZ, { lobbyId });
  };

  const deleteLobby = (lobbyId: string) => {
    const s = getSocket();
    if (s) {
      s.emit(SOCKET_EVENTS.DELETE_LOBBY, { lobbyId, instructorId });
    }
    onNotificationRef.current('Deleted!', 'Lobby deleted successfully!');
  };

  return {
    lobbies: sortLobbies(lobbies),
    instructorId,
    createLobby,
    joinLobby,
    startQuiz,
    endQuiz,
    deleteLobby,
    isJoining,
  };
};