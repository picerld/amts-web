import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/utils/trpc";
import { QuestionFormSchema, questionFormSchema } from "../forms/question";

import { Form } from "@/components/ui/form";
import { QuestionFormInner } from "./QuestionFormInner";
import { TopicFormOuter } from "./TopicFormOuter";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const QuestionFormOuter = () => {
  const utils = trpc.useUtils();

  const [bankId, setBankId] = useState<number | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  const form = useForm<QuestionFormSchema>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question: "",
      answers: [
        { option: "A", text: "", isTrue: false },
        { option: "B", text: "", isTrue: false },
        { option: "C", text: "", isTrue: false },
        { option: "D", text: "", isTrue: false },
      ],
      correctAnswerIndex: 0,
      bankId: 0,
    },
  });

  const { data: questions } = trpc.question.getByBankId.useQuery(
    { bankId: bankId ?? 0 },
    { enabled: bankId !== null }
  );

  const { data: selectedQuestionData } = trpc.question.getById.useQuery(
    { id: selectedQuestion! },
    {
      enabled: !!selectedQuestion,
    }
  );

  useEffect(() => {
    if (selectedQuestionData) {
      const { question, answers, bankId } = selectedQuestionData;

      form.reset({
        question,
        bankId,
        answers: answers.map((a) => ({
          option: a.option,
          text: a.text,
          isTrue: a.isTrue,
        })),
        correctAnswerIndex: answers.findIndex((a) => a.isTrue),
      });
    }
  }, [selectedQuestionData, form]);

  useEffect(() => {
    const stored = localStorage.getItem("bankId");
    if (stored) {
      const id = Number(stored);
      setBankId(id);
      form.setValue("bankId", id);
    }
  }, [form]);

  const { mutate: createQuestion, isPending: createQuestionIsPending } =
    trpc.question.create.useMutation({
      onSuccess: (data) => {
        toast.success("Yeay! Pertanyaan berhasil dibuat!");
        form.reset();
        utils.question.getByBankId.invalidate({ bankId: data.bankId });
      },
      onError: (error) => {
        toast.error("Oops! Pertanyaan gagal dibuat!", {
          description: "Cek kembali form kamu!",
        });
      },
    });

  const { mutate: updateQuestion } = trpc.question.update.useMutation({
    onSuccess: (data) => {
      toast.success("Yeay! Pertanyaan berhasil diupdate!");
      form.reset();
      utils.question.getByBankId.invalidate({ bankId: data.bankId });
    },
    onError: (error) => {
      toast.error("Oops! Pertanyaan gagal diupdate!", {
        description: error.message,
      });
    },
  });

  const handleSubmitQuestion = (values: QuestionFormSchema) => {
    if (selectedQuestion) {
      updateQuestion({
        ...values,
        id: selectedQuestion,
      });
      return;
    }
    createQuestion(values);
  };

  const handleBankCreated = (id: number) => {
    setBankId(id);
    localStorage.setItem("bankId", id.toString());
    form.setValue("bankId", id);
    utils.question.getByBankId.invalidate({ bankId: id });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <h1 className="font-bold text-4xl">Bikin Bank Soal!</h1>
          <Button
            onClick={() => {
              localStorage.removeItem("bankId");
              localStorage.removeItem("questionId");
              localStorage.removeItem("topicTitle");
              window.location.reload();
            }}
          >
            Reset Semua!
          </Button>
        </CardTitle>
        <CardDescription>
          Isi form di bawah untuk membuat atau mengedit pertanyaan!
        </CardDescription>
      </CardHeader>

      <div className="grid grid-cols-3">
        <div className="col-span-1 mx-5">
          <TopicFormOuter onBankCreated={handleBankCreated} />

          <div className="flex flex-col mt-5 gap-3">
            {questions?.length === 0 && (
              <p className="text-sm text-gray-500">Belum ada pertanyaan.</p>
            )}
            {questions?.map((q, index) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuestion(q.id)}
                className={`border-purple-900 border shadow-shadow p-4 rounded-lg cursor-pointer hover:opacity-90 hover:border-main ${
                  selectedQuestion === q.id ? "border-main" : ""
                }`}
              >
                <strong>{index + 1}.</strong> {q.question}
              </div>
            ))}
          </div>

          {selectedQuestion && (
            <Button
              onClick={() => {
                setSelectedQuestion(null);
                form.reset({
                  question: "",
                  answers: [
                    { option: "A", text: "", isTrue: false },
                    { option: "B", text: "", isTrue: false },
                    { option: "C", text: "", isTrue: false },
                    { option: "D", text: "", isTrue: false },
                  ],
                  correctAnswerIndex: 0,
                  bankId: bankId!,
                });
              }}
              className="w-full mt-5"
            >
              Bikin soal baru!!
            </Button>
          )}
        </div>

        <div className="col-span-2">
          <Form {...form}>
            <QuestionFormInner
              onCreateQuestionSubmit={handleSubmitQuestion}
              isLoading={createQuestionIsPending}
            />
          </Form>
        </div>
      </div>
    </Card>
  );
};
