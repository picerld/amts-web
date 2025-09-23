"use client";

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useEffect } from "react";
import { studentFormSchema, StudentFormSchema } from "../../forms/student";
import { StudentUpdateFormInner } from "./StudentUpdateFormInner";

type StudentUpdateFormOuterProps = {
  userId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const StudentUpdateFormOuter = ({
  userId,
  open,
  onClose,
  onSuccess,
}: StudentUpdateFormOuterProps) => {
  const form = useForm<StudentFormSchema>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      id: "",
      username: "",
      password: "",
      roleId: 2,
    },
  });

  const { refetch } = trpc.users.getById.useQuery(
    { id: userId },
    { enabled: false }
  );

  const updateSubjectMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Success!!", {
        description: "Instructor updated successfully!",
      });

      form.reset();
      onClose();

      refetch();
      onSuccess?.();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You are not authorized!!", {
          description: error.message,
        });
      } else {
        toast.error("Oops! Something went wrong", {
          description: error.message,
        });
      }
    },
  });

  useEffect(() => {
    if (open) {
      refetch().then((res) => {
        if (res.data) {
          form.reset({
            id: res.data.id,
            username: res.data.username,
            password: res.data.password,
            roleId: res.data.roleId,
          });
        }
      });
    }
  }, [open, refetch, form]);

  function handleUpdateSubject(data: StudentFormSchema) {
    updateSubjectMutation.mutate({
      id: data.id,
      username: data.username,
      password: data.password,
      roleId: 2,
    });
  }

  return (
    <Form {...form}>
      <StudentUpdateFormInner
        open={open}
        isPending={updateSubjectMutation.isPending}
        onOpenChange={onClose}
        onStudentUpdate={handleUpdateSubject}
      />
    </Form>
  );
};
