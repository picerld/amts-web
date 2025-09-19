import { Form } from "@/components/ui/form";
import { trpc } from "@/utils/trpc";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { bankFormSchema, BankFormSchema } from "../forms/bank";
import { zodResolver } from "@hookform/resolvers/zod";
import { TopicFormInner } from "./TopicFormInner";
import { useState } from "react";

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
        userId: "36f079f2-c928-4deb-babc-478770e87e36",
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
