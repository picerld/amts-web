import { PageContainer } from "@/components/container/PageContainer";
import GuestLayout from "@/components/layout/GuestLayout";
import { LoginFormOuter } from "@/features/auth/components/LoginFormOuter";

export default function LoginPage() {
  return (
    <GuestLayout>
      <PageContainer>
        <div className="w-full flex items-center justify-center min-h-screen">
          <div className="flex flex-col sm:w-md space-y-8">
            <h1 className="font-bold text-4xl">Masuk AMTS</h1>
            <LoginFormOuter />
          </div>
        </div>
      </PageContainer>
    </GuestLayout>
  );
}
