import { useFormContext } from "react-hook-form";
import { type LoginFormSchema } from "../forms/login";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { ForgotPasswordContainer } from "./ForgotPasswordContainer";

type LoginFormInnerProps = {
  onLoginSubmit: (values: LoginFormSchema) => void;
  isPending: boolean;
};

export const LoginFormInner: React.FC<LoginFormInnerProps> = ({
  onLoginSubmit,
  isPending,
}) => {
  const form = useFormContext<LoginFormSchema>();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <form onSubmit={form.handleSubmit(onLoginSubmit)}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex font-bold">Username</FormLabel>
              <FormControl>
                <Input disabled={isPending} type="text" {...field} />
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
                      disabled={isPending}
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

        <ForgotPasswordContainer />

        <div className="w-full">
          <Button
            type="submit"
            className="w-full py-6 text-base"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center">
                <Loader className="mr-2 h-6 w-6 animate-spin" />
                Memproses
              </div>
            ) : (
              "Masuk Sekarang!"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
