import z from "zod";

export const studentFormSchema = z.object({
    id: z.string().optional(),
    username: z.string().min(1, {
        message: 'Username is required!',
    }),
    password: z.string().min(1, {
        message: 'Password is required!',
    }),
    roleId: z.number(),
});

export type StudentFormSchema = z.infer<typeof studentFormSchema>;