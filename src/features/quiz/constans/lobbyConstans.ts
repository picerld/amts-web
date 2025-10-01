export const LOBBY_STATUS = {
  WAITING: "WAITING",
  ONGOING: "ONGOING",
  FINISHED: "FINISHED",
} as const;

export type LobbyStatus = typeof LOBBY_STATUS[keyof typeof LOBBY_STATUS];

export const NOTIFICATION_DURATION = 3000;

export const SOCKET_EVENTS = {
  GET_LOBBIES: 'get-lobbies',
  LOBBY_UPDATED: 'lobby-updated',
  LOBBY_CREATED: 'lobby-created',
  CREATE_LOBBY: 'create-lobby',
  JOIN_LOBBY: 'join-lobby',
  JOIN_SUCCESS: 'join-success',
  JOIN_ERROR: 'join-error',
  LEAVE_LOBBY: 'leave-lobby',
  LEAVE_SUCCESS: 'leave-success',
  LOBBY_DELETED: 'lobby-deleted',
  DELETE_LOBBY: 'delete-lobby',
  QUIZ_STARTED: 'quiz-started',
  QUIZ_ENDED: 'quiz-ended',
  START_QUIZ: 'start-quiz',
  END_QUIZ: 'end-quiz',
  CHAT_MESSAGE: 'chat-message',
  CHAT_HISTORY: 'chat-history',
  GET_CHATS: 'get-chats',
  STUDENT_JOINED: 'student-joined',
  STUDENT_LEFT: 'student-left',
  BANK_UPDATED: 'bank-updated',
  UPDATE_LOBBY_BANK: 'update-lobby-bank',
} as const;

export const STORAGE_KEYS = {
  JOINED_LOBBY: 'joinedLobby',
} as const;

export const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  },
  card: {
    hidden: { opacity: 0, y: 40 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
    hover: { scale: 1.02 },
  },
};
