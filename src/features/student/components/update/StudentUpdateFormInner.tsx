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
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { StudentFormSchema } from "../../forms/student";

type StudentUpdateFormInnerProps = {
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentUpdate: (value: StudentFormSchema) => void;
};

export const StudentUpdateFormInner: React.FC<
  StudentUpdateFormInnerProps
> = ({ isPending, open, onOpenChange, onStudentUpdate }) => {
  const form = useFormContext<StudentFormSchema>();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Update Subject</DialogTitle>
          <DialogDescription className="text-base">
            You can update subject here!!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onStudentUpdate)}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex font-bold">Username</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="flex font-bold">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-5 flex cursor-pointer items-center text-gray-800"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div className="w-full">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Loading..." : "Update Information!"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
