import { Header } from "@/components/container/Header";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { InstructorFormOuter } from "../../components/create/InstructorFormOuter";

export default function InstructorCreatePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Create Subject" />
      <Header
        title="Register Instructor!"
        subtitle="Fill the fileds below to register new instructor!"
      >
        <Link
          href={"/instructors"}
          className={buttonVariants({
            variant: "default",
            className: "flex items-center gap-2",
          })}
        >
          <ChevronLeft className="h-4 w-4" />
          Go back
        </Link>
      </Header>

      <InstructorFormOuter />
    </GuardedLayout>
  );
}
