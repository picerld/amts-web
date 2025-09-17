import z from "zod";

export const bankFormSchema = z.object({
    title: z.string().min(1, {
        message: 'Topik harus diisi!',
    }),
});

export type BankFormSchema = z.infer<typeof bankFormSchema>;