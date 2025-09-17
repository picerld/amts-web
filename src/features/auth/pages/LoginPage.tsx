import { PageContainer } from "@/components/container/PageContainer";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { LoginFormOuter } from "../components/LoginFormOuter";

export default function LoginPage() {
  return (
    <PageContainer>
      <HeadMetaData title="Auth" />
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="flex flex-col sm:w-md space-y-8">
          <h1 className="font-bold text-4xl">Masuk Inventory</h1>
          <LoginFormOuter />
        </div>
      </div>
    </PageContainer>
  );
}
