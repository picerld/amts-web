import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFormContext, useFieldArray } from "react-hook-form";
import { QuestionFormSchema } from "../forms/question";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IsRequired } from "@/components/ui/is-required";
import { useEffect } from "react";

type Props = {
  onCreateQuestionSubmit: (values: QuestionFormSchema) => void;
  isLoading: boolean;
};

export const QuestionFormInner = ({
  onCreateQuestionSubmit,
  isLoading,
}: Props) => {
  const form = useFormContext<QuestionFormSchema>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  const answers = form.watch("answers");

  useEffect(() => {
    const correctIndex = form.getValues("correctAnswerIndex");
    if (correctIndex >= fields.length) {
      form.setValue("correctAnswerIndex", fields.length - 1);
    }
  }, [fields, form]);

  return (
    <form onSubmit={form.handleSubmit(onCreateQuestionSubmit)}>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold flex">
                Pertanyaan Kamu <IsRequired />
              </FormLabel>
              <FormControl>
                <Input placeholder="Apa makanan favorit kamu?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {fields.map((_, index) => (
          <div key={index} className="grid grid-cols-6 gap-4 items-center">
            <FormField
              control={form.control}
              name={`answers.${index}.option`}
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Option</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`answers.${index}.text`}
              render={({ field }) => (
                <FormItem className="col-span-5">
                  <FormLabel className="flex">
                    Jawaban Kamu <IsRequired />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nasi Goreng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        {fields.length > 0 && (
          <FormField
            control={form.control}
            name="correctAnswerIndex"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold flex">
                  Pilih Jawaban yang Benar <IsRequired />
                </FormLabel>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(val: string) => field.onChange(Number(val))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih salah satu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {answers.map((answer, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {answer.option || `Jawaban ${index + 1}`} —{" "}
                        {answer.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* <div className="flex gap-x-3">
          {fields.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Hapus Jawaban</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mau Hapus Jawaban?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Kamu akan menghapus jawaban terakhir dan tidak bisa
                    dikembalikan. Apakah kamu yakin?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Engga jadi</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      type="button"
                      onClick={() => remove(fields.length - 1)}
                    >
                      Ya, hapus jawaban
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            type="button"
            className="w-full"
            onClick={() =>
              append({
                option: String.fromCharCode(65 + fields.length),
                text: "",
                isTrue: false,
              })
            }
          >
            Tambah Jawaban
          </Button>
        </div> */}
      </CardContent>

      <CardFooter className="mt-5">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan Pertanyaan"}
        </Button>
      </CardFooter>
    </form>
  );
};
