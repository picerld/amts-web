import { publicProcedure, router } from '@/server/trpc';

export const userRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});
