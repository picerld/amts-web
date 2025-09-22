import { instructorFormSchema } from '@/features/instructor/forms/instructor';
import { publicProcedure, router } from '@/server/trpc';
import z from 'zod';

export const userRouter = router({
  getAllInstructor: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        roleId: 1,
      }
    });
  }),

  getAllStudent: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        roleId: 2,
      }
    });
  }),

  getPaginatedInstructor: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: z.string().optional().default(""),
      })
    )
        .query(async ({ ctx, input }) => {
        const { page, perPage, search } = input;

        const where: import("@prisma/client").Prisma.UserWhereInput = search
        ? {
            username: {
                contains: search,
                mode: "insensitive" as const,
            },
            }
        : {};

        const totalItems = await ctx.prisma.user.count({ where });
        const lastPage = Math.ceil(totalItems / perPage);

        const data = await ctx.prisma.user.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where: {
          ...where,
          roleId: 1
        },
        orderBy: { id: "desc" },
        include: { _count: {
          select: {
            Bank: true
          }
        } }
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

  getPaginatedStudent: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: z.string().optional().default(""),
      })
    )
        .query(async ({ ctx, input }) => {
        const { page, perPage, search } = input;

        const where: import("@prisma/client").Prisma.UserWhereInput = search
        ? {
            username: {
                contains: search,
                mode: "insensitive" as const,
            },
            }
        : {};

        const totalItems = await ctx.prisma.user.count({ where });
        const lastPage = Math.ceil(totalItems / perPage);

        const data = await ctx.prisma.user.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where: {
          ...where,
          roleId: 2
        },
        orderBy: { id: "desc" },
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
  
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    return ctx.prisma.user.findUnique({ where: { id: input.id } });
  }),

  create: publicProcedure.input(instructorFormSchema).mutation(async ({ input, ctx }) => {
    return ctx.prisma.user.create({ data: input });
  }),

  update: publicProcedure.input(instructorFormSchema).mutation(async ({ input, ctx }) => {
    return ctx.prisma.user.update({ where: { id: input.id }, data: input });
  }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return ctx.prisma.user.delete({ where: { id: input } });
  }),
});
