import { publicProcedure, router } from "@/server/trpc";
import z from "zod";

export const bankRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.bank.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
        return ctx.prisma.bank.findFirst({ where: { id: input.id } });
    }),

    create: publicProcedure
    .input(z.object({
        title: z.string().min(1, {
            message: 'Topik harus diisi!!'
        }),
        userId: z.string()
    })).mutation(async ({ input, ctx }) => {
        return ctx.prisma.bank.create({ data: input });
    })
});
