import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";

export const answerRouter = router({
  create: publicProcedure
    .input(
      z.object({
        option: z.string(),
        text: z.string(),
        isTrue: z.boolean(),
        questionId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.answer.create({ data: input });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        option: z.string().optional(),
        text: z.string().optional(),
        isTrue: z.boolean().optional(),
      })
    )
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

  getUserAnswers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.userAnswer.findMany({
        where: { userId: input.userId },
      });
    }),

  submitUserAnswers: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        answers: z.array(
          z.object({
            questionId: z.number(),
            answerId: z.number().nullable(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, answers } = input;

      const result = await Promise.all(
        answers.map(async ({ questionId, answerId }) => {
          const existing = await ctx.prisma.userAnswer.findFirst({
            where: { userId, questionId },
          });

          return existing
            ? ctx.prisma.userAnswer.update({
                where: { id: existing.id },
                data: { answerId },
              })
            : ctx.prisma.userAnswer.create({
                data: { userId, questionId, answerId },
              });
        })
      );

      return result;
    }),
});
