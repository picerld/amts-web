import { Header } from "@/components/container/Header";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SubjectFormOuter } from "../../components/create/SubjectFormOuter";

export default function SubjectCreatePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Create Subject" />
      <Header
        title="New Subject!"
        subtitle="Fill the fileds below to create new subject!"
      >
        <Link
          href={"/subjects"}
          className={buttonVariants({
            variant: "default",
            className: "flex items-center gap-2",
          })}
        >
          <ChevronLeft className="h-4 w-4" />
          Go back
        </Link>
      </Header>

      <SubjectFormOuter />
    </GuardedLayout>
  );
}
