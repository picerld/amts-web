import z from "zod";
import { unparse } from "papaparse";
import { publicProcedure, router } from "@/server/trpc";

export const userGradeRouter = router({
    getPaginated: publicProcedure
    .input(
        z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(10),
        search: z.string().optional().default(""),
        type: z.string().optional(),
        createdAt: z.string().datetime().optional(),
        bankId: z.number().optional(),
        })
    )
    .query(async ({ ctx, input }) => {
        const { page, perPage, search, type, createdAt, bankId } = input;

        const where: import("@prisma/client").Prisma.UserGradeWhereInput = {
        ...(search
            ? {
                user: {
                username: { contains: search, mode: "insensitive" },
                },
            }
            : {}),
        ...(type
            ? {
                bank: {
                type: { contains: type, mode: "insensitive" },
                },
            }
            : {}),
        ...(createdAt
            ? (() => {
                const day = new Date(createdAt);
                const startOfDay = new Date(day);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(day);
                endOfDay.setHours(23, 59, 59, 999);

                return {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                };
            })()
            : {}),
        ...(bankId
            ? {
                bankId: bankId,
            }
            : {}),
        };

        const totalItems = await ctx.prisma.userGrade.count({ where });
        const lastPage = Math.ceil(totalItems / perPage);

        const data = await ctx.prisma.userGrade.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where,
        orderBy: { id: "desc" },
        include: { bank: true, user: true },
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
        return ctx.prisma.userGrade.findMany({
            orderBy: { createdAt: 'desc' },
            include: { bank: true, user: true }
        });
    }),

    create: publicProcedure.input(z.object({
        userId: z.string(),
        grade: z.number(),
        bankId: z.number(),
    })).mutation(async ({ ctx, input }) => {
        return ctx.prisma.userGrade.create({
            data: {
                userId: input.userId,
                bankId: input.bankId,
                grade: input.grade,
            }
        });
    }),

        exportCsv: publicProcedure
    .input(
      z.object({
        bankId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { startDate, endDate, bankId } = input;

      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      const usersGrade = await ctx.prisma.userGrade.findMany({
        where: {
            ...(startDate && {
                updatedAt: {
                    gte: new Date(startDate),
                    lte: endDateObj,
                },
            }),
            ...(bankId && {
                bankId: bankId,
            }),
        },
        include: {
          bank: {
            select: {
              title: true,
              type: true,
              category: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      const formattedItems = usersGrade.map((userGrade) => ({
        id: userGrade.id,
        username: userGrade.user.username,
        title: userGrade.bank.title,
        type: userGrade.bank.type,
        category: userGrade.bank.category,
        grade: userGrade.grade,
        createdAt: new Date(userGrade.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }),
    }));
    
    let csv = unparse(formattedItems, { header: false, delimiter: ";" });

    const customHeaders = [
        "Id",
        "Student",
        "Subject",
        "Type",
        "Category",
        "Grade",
        "Date",
    ].join(";");

        csv = customHeaders + "\n" + csv;

        const fileName = `Grades - ${new Date(endDate).toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
        })}`;

        return { csv, fileName };
    }),
});
