import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { QuestionCard } from "../QuestionCard";

export const OverviewTabContent = () => (
  <div className="flex flex-col gap-6 w-full">
    <div className="flex flex-col pb-5 gap-2">
      <h1 className="text-4xl font-bold">AFTS</h1>
      <p className="text-lg truncate">Overview soal dan jawaban!</p>
    </div>

    <div className="flex justify-between w-full">
      <Card className="w-[350px]">
        <CardTitle className="px-5 pt-5 text-xl">Overview</CardTitle>
        <CardContent className="text-lg">10</CardContent>
      </Card>

      <div className="flex gap-3">
        <Card className="w-[250px]">
          <CardTitle className="px-5 pt-5 text-xl">Total Soal</CardTitle>
          <CardContent className="text-lg">10</CardContent>
        </Card>
        <Card className="w-[250px]">
          <CardTitle className="px-5 pt-5 text-xl">Total Peserta</CardTitle>
          <CardContent className="text-lg">30</CardContent>
        </Card>
      </div>
    </div>

    <div className="flex justify-between pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Soal Terbaru</h1>
        <p className="text-lg truncate">Beberapa soal terbaru!</p>
      </div>
      <Link
        href={"/question/create"}
        className={buttonVariants({ variant: "default" })}
      >
        Bikin Soal
        <Plus className="size-14" strokeWidth={3} />
      </Link>
    </div>
    <QuestionCard />
  </div>
);
