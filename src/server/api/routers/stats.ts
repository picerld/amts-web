import { publicProcedure, router } from "@/server/trpc";

export const statsRouter = router({
    subjects: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.bank.count();
    }),

    userWithGrade: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.userGrade.count();
    }),

    students: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.user.count({
            where: {
                roleId: 2,
            }
        })
    }),
});
