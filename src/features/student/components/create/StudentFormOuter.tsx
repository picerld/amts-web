import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { studentFormSchema, StudentFormSchema } from "../../forms/student";
import { StudentFormInner } from "./StudentFormInner";

export const StudentFormOuter = () => {
  const router = useRouter();

  const { mutate: createStudent, isPending: createStudentIsPending } =
    trpc.users.create.useMutation({
      onSuccess: () => {
        toast.success("Student registered successfully!", {
          duration: 2000,
          description: "Please wait a few seconds...",
        });

        form.reset();

        setTimeout(() => {
          router.push("/students");
        }, 1000);
      },
      onError: (error) => {
        console.log(error);
        toast.error("Oops! Pertanyaan gagal dibuat!", {
          description: error.message,
        });
      },
    });

  const form = useForm<StudentFormSchema>({
    resolver: zodResolver(studentFormSchema),
    disabled: createStudentIsPending,
    defaultValues: {
      username: "",
      password: "",
      roleId: 2,
    },
  });

  function handleSubmitStudent(data: StudentFormSchema) {
    createStudent(data);
  }

  return (
    <Form {...form}>
      <StudentFormInner
        onCreateStudent={handleSubmitStudent}
        isPending={createStudentIsPending}
      />
    </Form>
  );
};
