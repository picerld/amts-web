import { Form } from "@/components/ui/form";
import { trpc } from "@/utils/trpc";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { bankFormSchema, BankFormSchema } from "../forms/bank";
import { zodResolver } from "@hookform/resolvers/zod";
import { TopicFormInner } from "./TopicFormInner";
import { useState } from "react";
import Cookies from "js-cookie";

type TopicFormOuterProps = {
  onBankCreated?: (id: number) => void;
};

export const TopicFormOuter = ({ onBankCreated }: TopicFormOuterProps) => {
  const [disabled, setDisabled] = useState(false);

  const { mutate: createBank, isPending: createBankIsPending } =
    trpc.bank.create.useMutation({
      onSuccess: (data) => {
        toast.success("Topik berhasil dibuat!", {
          duration: 2000,
          description: "Tunggu beberapa saat untuk membuat pertanyaan..",
        });

        localStorage.setItem("bankId", data.id.toString());

        onBankCreated?.(data.id);

        setDisabled(true);
      },
      onError: (error) => {
        console.log(error);
        toast.error("Oops! Pertanyaan gagal dibuat!", {
          description: error.message,
        });
      },
    });

  const form = useForm<BankFormSchema>({
    resolver: zodResolver(bankFormSchema),
    disabled: createBankIsPending,
    defaultValues: {
      title: "",
    },
  });

  function handleSubmitTopic(value: BankFormSchema) {
    try {
      createBank({
        title: value.title,
        userId: Cookies.get("user.id") ?? "",
        type: "topic",
        category: value.category,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Form {...form}>
      <TopicFormInner
        disabled={disabled}
        onCreateTopicSubmit={handleSubmitTopic}
        isLoading={createBankIsPending}
      />
    </Form>
  );
};
