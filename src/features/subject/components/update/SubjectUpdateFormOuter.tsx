"use client";

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useEffect } from "react";
import { subjectFormSchema, SubjectFormSchema } from "../../forms/subject";
import { SubjectUpdateFormInner } from "./SubjectUpdateFormInner";

type SubjectUpdateFormOuterProps = {
  subjectId: number;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const SubjectUpdateFormOuter = ({
  subjectId,
  open,
  onClose,
  onSuccess,
}: SubjectUpdateFormOuterProps) => {
  const form = useForm<SubjectFormSchema>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      id: 0,
      title: "",
      userId: "",
      type: "",
      category: "",
    },
  });

  const { refetch } = trpc.bank.getById.useQuery(
    { id: subjectId },
    { enabled: false }
  );

  const updateSubjectMutation = trpc.bank.update.useMutation({
    onSuccess: () => {
      toast.success("Success!!", {
        description: "Subject updated successfully!",
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
            title: res.data.title,
            userId: res.data.userId,
            type: res.data.type,
            category: res.data.category,
          });
        }
      });
    }
  }, [open, refetch, form]);

  function handleUpdateSubject(data: SubjectFormSchema) {
    updateSubjectMutation.mutate({
      id: data.id,
      title: data.title,
      userId: data.userId,
      type: data.type,
      category: data.category,
    });
  }

  return (
    <Form {...form}>
      <SubjectUpdateFormInner
        open={open}
        onOpenChange={(state) => !state && onClose()}
        isPending={updateSubjectMutation.isPending}
        onUserPasswordUpdateSubmit={handleUpdateSubject}
      />
    </Form>
  );
};
