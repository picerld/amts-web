import { router } from '@/server/trpc';
import { questionRouter } from './routers/question';
import { answerRouter } from './routers/answer';
import { userRouter } from './routers/user';
import { authRouter } from './routers/auth';
import { bankRouter } from './routers/bank';

export const appRouter = router({
  question: questionRouter,
  bank: bankRouter,
  answer: answerRouter,
  users: userRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
