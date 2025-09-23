"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { QuestionCard } from "../QuestionCard";
import { trpc } from "@/utils/trpc";

export const OverviewTabContent = () => {
  const { data: subjects } = trpc.stats.subjects.useQuery();
  const { data: grade } = trpc.stats.userWithGrade.useQuery();
  const { data: students } = trpc.stats.students.useQuery();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col pb-5 gap-2">
        <h1 className="text-4xl font-bold">AFTS</h1>
        <p className="text-lg truncate">Overview AFTS subjects!</p>
      </div>

      <div className="flex justify-between w-full">
        <Card className="w-[350px]">
          <CardTitle className="px-5 pt-5 text-xl">All Subjects</CardTitle>
          <CardContent className="text-lg">{subjects?.toString()}</CardContent>
        </Card>

        <div className="flex gap-3">
          <Card className="w-[250px]">
            <CardTitle className="px-5 pt-5 text-xl">User with Grade</CardTitle>
            <CardContent className="text-lg">{grade?.toString()}</CardContent>
          </Card>
          <Card className="w-[250px]">
            <CardTitle className="px-5 pt-5 text-xl">Total Students</CardTitle>
            <CardContent className="text-lg">
              {students?.toString()}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between pt-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">New Subjects</h1>
          <p className="text-lg truncate">Newest subjects from AFTS!</p>
        </div>
        <Link
          href={"/subjects/create"}
          className={buttonVariants({ variant: "default" })}
        >
          Add new Subjects
          <Plus className="size-14" strokeWidth={3} />
        </Link>
      </div>
      <QuestionCard />
    </div>
  );
};
