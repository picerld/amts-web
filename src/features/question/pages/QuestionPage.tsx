import AppLayout from "@/components/layout/AppLayout";
import { QuestionFormOuter } from "../components/QuestionFormOuter";

export default function QuestionPage() {
  return (
    <AppLayout>
      <div className="flex items-start sm:pt-32 sm:px-10 w-full h-screen">
        <QuestionFormOuter />
      </div>
    </AppLayout>
  );
}
