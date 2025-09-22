import { Header } from "@/components/container/Header";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { InstructorDatatable } from "../components/datatable/instructor-datatable";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InstructorPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Instructor" />
      <Header title="Instructor List" subtitle="See the list of instructors!">
        <Link
          href={"/instructors/create"}
          className={buttonVariants({
            variant: "default",
            className: "flex items-center gap-2",
          })}
        >
          <Plus className="h-4 w-4" />
          Register new instructor!
        </Link>
      </Header>
      <div className="w-full">
        <InstructorDatatable />
      </div>
    </GuardedLayout>
  );
}
