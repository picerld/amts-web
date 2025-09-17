import { z } from 'zod';
import { publicProcedure, router } from '@/server/trpc';

export const answerRouter = router({
  create: publicProcedure
    .input(z.object({
      option: z.string(),
      text: z.string(),
      isTrue: z.boolean(),
      questionId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.answer.create({ data: input });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      option: z.string().optional(),
      text: z.string().optional(),
      isTrue: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      return ctx.prisma.answer.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    return ctx.prisma.answer.delete({ where: { id: input } });
  }),
});
