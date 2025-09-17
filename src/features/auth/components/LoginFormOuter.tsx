import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormSchema } from "../forms/login";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { LoginFormInner } from "./LoginFormInner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const LoginFormOuter = () => {
  const router = useRouter();

  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutate: loginUser, isPending: loginIsPending } =
    trpc.auth.login.useMutation({
      onSuccess: async (data) => {
        toast.success("Berhasil Login", {
          description: "Selamat datang!!",
        });

        Cookies.set("auth.token", data.token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });

        Cookies.set("user.id", data.user.id, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 800);

        form.reset();
      },
      onError: () => {
        toast.error("Gagal Login", {
          description:
            "Username atau password anda salah, coba periksa kembali",
        });
      },
    });

  const handleLogin = (values: LoginFormSchema) => {
    if (values.username === "") {
      form.setError("username", { message: "Invalid username" });
      return;
    }

    loginUser(values);
  };

  return (
    <Form {...form}>
      <LoginFormInner onLoginSubmit={handleLogin} isPending={loginIsPending} />
    </Form>
  );
};
