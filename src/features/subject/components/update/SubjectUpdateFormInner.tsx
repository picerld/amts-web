"use client";

import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubjectFormSchema } from "../../forms/subject";
import { IsRequired } from "@/components/ui/is-required";

type SubjectUpdateFormInnerProps = {
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserPasswordUpdateSubmit: (value: SubjectFormSchema) => void;
};

export const SubjectUpdateFormInner: React.FC<SubjectUpdateFormInnerProps> = ({
  isPending,
  open,
  onOpenChange,
  onUserPasswordUpdateSubmit,
}) => {
  const form = useFormContext<SubjectFormSchema>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Update Subject</DialogTitle>
          <DialogDescription className="text-base">
            You can update subject here!!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onUserPasswordUpdateSubmit)}>
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

          <DialogFooter className="mt-10">
            <DialogClose asChild>
              <Button disabled={isPending} variant="neutral">
                No, Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Yes, Update Subject!"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
