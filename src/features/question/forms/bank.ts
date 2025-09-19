import z from "zod";

export const bankFormSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1, {
        message: 'Topik harus diisi!',
    }),
    userId: z.string(),
    type: z.string(),
    category: z.string(),
});

export type BankFormSchema = z.infer<typeof bankFormSchema>;