import { router } from '@/server/trpc';
import { questionRouter } from './routers/question';
import { answerRouter } from './routers/answer';
import { userRouter } from './routers/user';
import { authRouter } from './routers/auth';
import { bankRouter } from './routers/bank';
import { userGradeRouter } from './routers/grade';

export const appRouter = router({
  question: questionRouter,
  bank: bankRouter,
  answer: answerRouter,
  users: userRouter,
  auth: authRouter,
  userGrade: userGradeRouter,
});

export type AppRouter = typeof appRouter;
