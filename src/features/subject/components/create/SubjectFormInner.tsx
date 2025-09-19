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
import { useFormContext } from "react-hook-form";
import { SubjectFormSchema } from "../../forms/subject";

type SubjectFormInnerProps = {
  isLoading: boolean;
  onCreateSubjectSubmit: (values: SubjectFormSchema) => void;
};

export const SubjectFormInner = ({
  isLoading,
  onCreateSubjectSubmit,
}: SubjectFormInnerProps) => {
  const form = useFormContext<SubjectFormSchema>();

  return (
    <form onSubmit={form.handleSubmit(onCreateSubjectSubmit)}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold flex">
                Subject <IsRequired />
              </FormLabel>
              <FormControl>
                <Input placeholder="Example: Preflight Check" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-10">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold flex">
                  Type of Subject <IsRequired />
                </FormLabel>
                <FormControl>
                  <Input placeholder="PG or EX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold flex">
                  Category <IsRequired />
                </FormLabel>
                <FormControl>
                  <Input placeholder="NORMAL or EMERGENCY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="w-full flex mt-10 justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create new Subject!"}
        </Button>
      </div>
    </form>
  );
};
