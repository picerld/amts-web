import { z } from 'zod';
import { publicProcedure, router } from '@/server/trpc';
import { questionFormSchema } from '@/features/question/forms/question';

export const questionRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.question.findMany({ include: { answers: true } });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.question.findUnique({
        where: { id: input.id },
        include: { answers: true },
      });
    }),

  getByBankId: publicProcedure
    .input(z.object({ bankId: z.number() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.question.findMany({
        where: { bankId: input.bankId },
        orderBy: { createdAt: 'desc' },
        include: { answers: true },
      });
    }),

  create: publicProcedure
    .input(questionFormSchema)
    .mutation(async ({ input, ctx }) => {
      const { question, answers, correctAnswerIndex, bankId } = input;

      return ctx.prisma.question.create({
        data: {
          question,
          bankId,
          answers: {
            create: answers.map((a, idx) => ({
              ...a,
              isTrue: idx === correctAnswerIndex,
            })),
          },
        },
      });
    }),

  update: publicProcedure
    .input(
      questionFormSchema.extend({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, question, answers, correctAnswerIndex, bankId } = input;

      await ctx.prisma.answer.deleteMany({
        where: { questionId: id },
      });

      return ctx.prisma.question.update({
        where: { id },
        data: {
          question,
          bankId,
          answers: {
            create: answers.map((a, idx) => ({
              ...a,
              isTrue: idx === correctAnswerIndex,
            })),
          },
        },
      });
    }),

  delete: publicProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    return ctx.prisma.question.delete({ where: { id: input } });
  }),
});
