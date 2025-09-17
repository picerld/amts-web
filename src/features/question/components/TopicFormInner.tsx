import { useFormContext } from "react-hook-form";
import { BankFormSchema } from "../forms/bank";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IsRequired } from "@/components/ui/is-required";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type TopicFormInnerProps = {
  isLoading: boolean;
  disabled: boolean;
  onCreateTopicSubmit: (values: BankFormSchema) => void;
};

export const TopicFormInner = ({
  isLoading,
  disabled,
  onCreateTopicSubmit,
}: TopicFormInnerProps) => {
  const [bankId, setBankId] = useState<number | null>(null);
  const [storedTitle, setStoredTitle] = useState<string | null>(null);

  const form = useFormContext<BankFormSchema>();

  useEffect(() => {
    const storedBankId = localStorage.getItem("bankId");
    const storedTitle = localStorage.getItem("topicTitle");

    if (storedBankId) {
      setBankId(Number(storedBankId));
    }

    if (storedTitle) {
      setStoredTitle(storedTitle);
      form.setValue("title", storedTitle);
    }
  }, [form]);

  const handleSubmit = form.handleSubmit((values) => {
    localStorage.setItem("topicTitle", values.title);
    onCreateTopicSubmit(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      {bankId ? (
        <h1 className="font-bold text-2xl">
          {storedTitle}
        </h1>
      ) : (
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold flex">
                Topik Soal <IsRequired />
              </FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Contoh: Cara membuat makanan"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {!bankId && (
        <Button type="submit" className="w-full mt-5" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Buat Topik Soal!"}
        </Button>
      )}
    </form>
  );
};
