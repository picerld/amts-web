import z from "zod";

export const subjectFormSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1, {
        message: 'Name of subject is required!',
    }),
    userId: z.string({
        message: "User ID is required",
    }),
    type: z.string().min(1, {
        message: 'Type of subject is required!',
    }),
    category: z.string().min(1, {
        message: 'Category of subject is required!',
    }),
});

export type SubjectFormSchema = z.infer<typeof subjectFormSchema>;