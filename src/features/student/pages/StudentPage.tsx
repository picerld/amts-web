import { Header } from "@/components/container/Header";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { StudentDatatable } from "../components/datatable/student-datatable";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function StudentPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Student" />
      <Header title="Student List" subtitle="See the list of students!">
        <Link
          href={"/students/create"}
          className={buttonVariants({
            variant: "default",
            className: "flex items-center gap-2",
          })}
        >
          <Plus className="h-4 w-4" />
          Register new student!
        </Link>
      </Header>
      <div className="w-full">
        <StudentDatatable />
      </div>
    </GuardedLayout>
  );
}
