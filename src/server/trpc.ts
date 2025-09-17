import { initTRPC } from '@trpc/server';
import { prisma } from '@/lib/prisma';

export type Context = {
  prisma: typeof prisma;
};

export const createContext = async (): Promise<Context> => {
  return { prisma };
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
