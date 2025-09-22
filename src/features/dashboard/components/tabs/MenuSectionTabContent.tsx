import { buttonVariants } from "@/components/ui/button";
import {
  NotebookPen,
  Plus,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

export const MenuSectionTabContent = () => (
  <div className="w-full -m-6 min-h-screen">
    <div className="bg-background">
      <div className="relative overflow-hidden">
        <div className="relative px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6">AFTS Dashboard</h1>
            <p className="text-xl mb-8">
              Platform manajemen soal dan peserta terdepan
            </p>
            <Link
              href={"/subjects"}
              className={buttonVariants({
                variant: "neutral",
                size: "lg",
                className: "px-10 py-6 text-lg!",
              })}
            >
              <Plus className="size-6!" />
              Mulai Bikin Soal
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-8 -mt-8">
            <Link
              href="/subjects"
              className={buttonVariants({
                size: "lg",
                className: "px-10 py-8 text-lg! rounded-full",
              })}
            >
              <NotebookPen className="size-6!" strokeWidth={2.5} />
              Assessment Database
            </Link>
            <Link
              href="/students"
              className={buttonVariants({
                size: "lg",
                className: "px-10 py-8 text-lg! rounded-full",
              })}
            >
              <UsersRound className="size-6!" strokeWidth={2.5} />
              User Database
            </Link>
            <Link
              href="/reports"
              className={buttonVariants({
                size: "lg",
                className: "px-10 py-8 text-lg! rounded-full",
              })}
            >
              <TrendingUp className="size-6!" strokeWidth={2.5} />
              Assessment Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);
