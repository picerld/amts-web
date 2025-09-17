import { AnswerSchema } from '@/schemas/question';
import { z } from 'zod';

export const questionFormSchema = z.object({
  question: z.string().min(1, {
    message: 'Oops! Kamu tidak boleh membuat pertanyaan kosong.',
  }),
  answers: z.array(AnswerSchema).min(1, {
    message: 'Oops! Kamu tidak boleh membuat pertanyaan tanpa jawaban.',
  }),
  correctAnswerIndex: z.number(),
  bankId: z.number(),
});

export type QuestionFormSchema = z.infer<typeof questionFormSchema>;
