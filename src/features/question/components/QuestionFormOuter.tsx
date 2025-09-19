import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/utils/trpc";
import { QuestionFormSchema, questionFormSchema } from "../forms/question";

import { Form } from "@/components/ui/form";
import { QuestionFormInner } from "./QuestionFormInner";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IBank } from "@/types/bank";
import { Plus } from "lucide-react";

export const QuestionFormOuter = ({ subject }: { subject?: IBank }) => {
  const utils = trpc.useUtils();

  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

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
    { bankId: subject?.id ?? 0 },
    { enabled: subject?.id !== null }
  );

  const { data: selectedQuestionData } = trpc.question.getById.useQuery(
    { id: selectedQuestion! },
    {
      enabled: !!selectedQuestion,
    }
  );

  const filteredQuestions =
    questions?.filter((q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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
      setShowForm(true);
    }
  }, [selectedQuestionData, form]);

  useEffect(() => {
    const stored = localStorage.getItem("bankId");
    if (stored) {
      const id = Number(stored);
      form.setValue("bankId", id);
    }
  }, [form]);

  const { mutate: createQuestion, isPending: createQuestionIsPending } =
    trpc.question.create.useMutation({
      onSuccess: (data) => {
        toast.success("Yeay! Pertanyaan berhasil dibuat!");
        form.reset();
        setShowForm(false);
        setSelectedQuestion(null);
        utils.question.getByBankId.invalidate({ bankId: data.bankId });
      },
      onError: (error) => {
        toast.error("Oops! Pertanyaan gagal dibuat!", {
          description: "Cek kembali form kamu!",
        });

        console.log(error);
      },
    });

  const { mutate: updateQuestion } = trpc.question.update.useMutation({
    onSuccess: (data) => {
      toast.success("Yeay! Pertanyaan berhasil diupdate!");
      form.reset();
      setShowForm(false);
      setSelectedQuestion(null);
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
    createQuestion({
      question: values.question,
      answers: values.answers,
      correctAnswerIndex: values.correctAnswerIndex,
      bankId: subject?.id ?? 0,
    });
  };

  const handleNewQuestion = () => {
    setSelectedQuestion(null);
    setShowForm(true);
    form.reset({
      question: "",
      answers: [
        { option: "A", text: "", isTrue: false },
        { option: "B", text: "", isTrue: false },
        { option: "C", text: "", isTrue: false },
        { option: "D", text: "", isTrue: false },
      ],
      correctAnswerIndex: 0,
      bankId: subject?.id,
    });
  };

  const handleEditQuestion = (questionId: number) => {
    setSelectedQuestion(questionId);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedQuestion(null);
    form.reset();
  };

  if (showForm) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {selectedQuestion ? "Edit Pertanyaan" : "Buat Pertanyaan Baru"}
              </CardTitle>
              <CardDescription>{subject?.title}</CardDescription>
            </div>
            <Button variant="neutral" onClick={handleCancelForm}>
              Back to subject
            </Button>
          </div>
        </CardHeader>

        <div className="px-6 pb-6">
          <Form {...form}>
            <QuestionFormInner
              onCreateQuestionSubmit={handleSubmitQuestion}
              isLoading={createQuestionIsPending}
            />
          </Form>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{subject?.title}</CardTitle>
            <CardDescription>
              {questions?.length || 0} questions total
            </CardDescription>
          </div>
          <Button onClick={handleNewQuestion}>
            <Plus />
            Create new question
          </Button>
        </div>

        {questions && questions.length > 0 && (
          <div className="mt-4">
            <Input
              placeholder="Search your question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        )}
      </CardHeader>

      <div className="px-6 pb-6">
        {filteredQuestions.length === 0 && searchQuery === "" && (
          <div className="text-center py-12">
            <p className="mb-4 text-gray-500">No question found.</p>
            <Button onClick={handleNewQuestion}>Create question!</Button>
          </div>
        )}

        {filteredQuestions.length === 0 && searchQuery !== "" && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No question found with keywoard &quot;{searchQuery}
              &quot;
            </p>
          </div>
        )}

        {filteredQuestions.length > 0 && (
          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <Card
                key={q.id}
                className="cursor-pointer border-border border-2 shadow-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between w-full gap-2 mb-2">
                        <span className="px-2 py-1 rounded text-lg font-medium">
                          #
                          {(questions?.findIndex((item) => item.id === q.id) ??
                            -1) + 1}
                        </span>
                        <div className="flex gap-5">
                          <Button
                            size="sm"
                            variant="neutral"
                            onClick={() => handleEditQuestion(q.id)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                      <p className="text-base font-semibold mb-2 line-clamp-2">
                        {q.question}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {q.answers.map((answer) => (
                          <div
                            key={answer.option}
                            className={`text-xs p-2 rounded ${
                              answer.isTrue
                                ? "bg-main text-white border border-green-200"
                                : "bg-white/50 text-gray-600 border-border border"
                            }`}
                          >
                            <strong>{answer.option}.</strong> {answer.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
