import { Form } from "@/components/ui/form";
import { trpc } from "@/utils/trpc";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { SubjectFormInner } from "./SubjectFormInner";
import { subjectFormSchema, SubjectFormSchema } from "../../forms/subject";
import { useRouter } from "next/navigation";

export const SubjectFormOuter = () => {
  const router = useRouter();

  const { mutate: createBank, isPending: createSubjectIsPending } =
    trpc.bank.create.useMutation({
      onSuccess: () => {
        toast.success("Subject created successfully!", {
          duration: 2000,
          description: "Please wait a few seconds...",
        });

        form.reset();

        setTimeout(() => {
          router.push("/subjects");
        }, 1000);
      },
      onError: (error) => {
        console.log(error);
        toast.error("Oops! Pertanyaan gagal dibuat!", {
          description: error.message,
        });
      },
    });

  const form = useForm<SubjectFormSchema>({
    resolver: zodResolver(subjectFormSchema),
    disabled: createSubjectIsPending,
    defaultValues: {
      title: "",
      userId: "",
      type: "",
      category: "",
    },
  });

  function handleSubmitSubject(value: SubjectFormSchema) {
    const userId = Cookies.get("user.id") ?? "";

    createBank({
      title: value.title,
      userId: userId,
      type: value.type,
      category: value.category,
    });
  }

  return (
    <Form {...form}>
      <SubjectFormInner
        onCreateSubjectSubmit={handleSubmitSubject}
        isLoading={createSubjectIsPending}
      />
    </Form>
  );
};
