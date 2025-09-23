import { Header } from "@/components/container/Header";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { StudentFormOuter } from "../../components/create/StudentFormOuter";

export default function StudentCreatePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Create Subject" />
      <Header
        title="Add Student!"
        subtitle="Fill the fileds below to add student!"
      >
        <Link
          href={"/students"}
          className={buttonVariants({
            variant: "default",
            className: "flex items-center gap-2",
          })}
        >
          <ChevronLeft className="h-4 w-4" />
          Go back
        </Link>
      </Header>

      <StudentFormOuter />
    </GuardedLayout>
  );
}
