import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  instructorFormSchema,
  InstructorFormSchema,
} from "../../forms/instructor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InstructorFormInner } from "./InstructorFormInner";

export const InstructorFormOuter = () => {
  const router = useRouter();

  const { mutate: createInstructor, isPending: createInstructorIsPending } =
    trpc.users.create.useMutation({
      onSuccess: () => {
        toast.success("Instructor registered successfully!", {
          duration: 2000,
          description: "Please wait a few seconds...",
        });

        form.reset();

        setTimeout(() => {
          router.push("/instructors");
        }, 1000);
      },
      onError: (error) => {
        console.log(error);
        toast.error("Oops! Pertanyaan gagal dibuat!", {
          description: error.message,
        });
      },
    });

  const form = useForm<InstructorFormSchema>({
    resolver: zodResolver(instructorFormSchema),
    disabled: createInstructorIsPending,
    defaultValues: {
      username: "",
      password: "",
      roleId: 1,
    },
  });

  function handleSubmitInstructor(data: InstructorFormSchema) {
    createInstructor(data);
  }

  return (
    <Form {...form}>
      <InstructorFormInner
        onCreateInstructor={handleSubmitInstructor}
        isPending={createInstructorIsPending}
      />
    </Form>
  );
};
