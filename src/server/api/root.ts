import { router } from '@/server/trpc';
import { questionRouter } from './routers/question';
import { answerRouter } from './routers/answer';
import { userRouter } from './routers/user';
import { authRouter } from './routers/auth';
import { bankRouter } from './routers/bank';
import { userGradeRouter } from './routers/grade';
import { statsRouter } from './routers/stats';
import { lobbyRouter } from './routers/lobby';

export const appRouter = router({
  question: questionRouter,
  bank: bankRouter,
  answer: answerRouter,
  users: userRouter,
  auth: authRouter,
  userGrade: userGradeRouter,
  stats: statsRouter,
  // exams
  lobby: lobbyRouter,
});

export type AppRouter = typeof appRouter;
