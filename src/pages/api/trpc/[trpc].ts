import { createNextApiHandler } from '@trpc/server/adapters/next';
import { createContext } from '@/server/trpc';
import { appRouter } from '@/server/api/root';

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
