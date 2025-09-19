import { subjectFormSchema } from "@/features/subject/forms/subject";
import { publicProcedure, router } from "@/server/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const bankRouter = router({
    getPaginated: publicProcedure
    .input(
        z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: z.string().optional().default(""),
        })
    )
    .query(async ({ ctx, input }) => {
        const { page, perPage, search } = input;

        const where: import("@prisma/client").Prisma.BankWhereInput = search
        ? {
            title: {
                contains: search,
                mode: "insensitive" as const,
            },
            }
        : {};

        const totalItems = await ctx.prisma.bank.count({ where });
        const lastPage = Math.ceil(totalItems / perPage);

        const data = await ctx.prisma.bank.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        orderBy: { id: "desc" },
        include: { user: true },
        });

        return {
            data,
            meta: {
                currentPage: page,
                lastPage,
                perPage,
                totalItems,
            },
        };
    }),
    
    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.bank.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
        return ctx.prisma.bank.findFirst({ where: { id: input.id } });
    }),

    create: publicProcedure.input(subjectFormSchema).mutation(async ({ input, ctx }) => {
        return ctx.prisma.bank.create({ 
            data: {
                title: input.title,
                userId: input.userId,
                type:   input.type,
                category: input.category
            }
         });
    }),

    delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
        try {
        return await ctx.prisma.bank.delete({
            where: { id: input.id },
        });
        } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2003"
        ) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Cannot delete this subject!",
            });
        }
            throw error;
        }
    }),

    update: publicProcedure.input(subjectFormSchema)
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.bank.update({
                where: { id: input.id },
                data: { 
                    title: input.title,
                    userId: input.userId,
                    type:   input.type,
                    category: input.category,
                    updatedAt: new Date(),
                },
            });
    }),
});
