import z from "zod";

export const AnswerSchema = z.object({
  option: z.string().min(1, {
    message: "Oops! Kamu tidak boleh membuat pertanyaan tanpa jawaban.",
  }),
  text: z.string().min(1, {
    message: "Oops! Kamu tidak boleh membuat pertanyaan tanpa jawaban.",
  }),
  isTrue: z.boolean(),
});