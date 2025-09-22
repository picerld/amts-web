import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import GuardedLayout from "@/components/layout/GuardedLayout";
import { Header } from "@/components/container/Header";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronLeft, CloudDownload, Trophy } from "lucide-react";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReportSubjectStatsCard } from "@/features/report/components/ReportSubjectStatsCard";

export default function Page() {
  const router = useRouter();
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    if (router.query.id) {
      setId(Number(router.query.id));
    }
  }, [router.query.id]);

  const { data } = trpc.bank.getById.useQuery(
    { id: id! },
    { enabled: id !== null }
  );

  const getGradeLabel = (grade: number) => {
    if (grade >= 90) return "Excellent";
    if (grade >= 80) return "Good";
    if (grade >= 70) return "Satisfactory";
    return "Needs Improvement";
  };

  const calculateStats = () => {
    if (!data?.userGrade?.length)
      return { average: 0, highest: 0, lowest: 0, total: 0 };

    const grades = data.userGrade.map((user) => user.grade);
    const total = grades.length;
    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    const average = Math.round((sum / total) * 10) / 10;
    const highest = Math.max(...grades);
    const lowest = Math.min(...grades);

    return { average, highest, lowest, total };
  };

  if (!id || !data) return <div>Loading...</div>;

  const stats = calculateStats();

  return (
    <GuardedLayout>
      <HeadMetaData
        title={data?.title}
        metaDescription="Student report by subject"
        pathName={`/reports/${id}`}
      />
      <Header title={data.title} subtitle="See all the grades of students!">
        <Link
          href="/reports"
          className={buttonVariants({
            variant: "default",
            className: "flex items-center gap-2",
          })}
        >
          <ChevronLeft className="h-4 w-4" />
          All reports
        </Link>
      </Header>

      <div className="space-y-6">
        <ReportSubjectStatsCard stats={stats} />

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex justify-between">
              Student Grades
              <Button>
                <CloudDownload />
                Export to CSV
              </Button>
            </CardTitle>
            <CardDescription>
              Detailed breakdown of all student performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.userGrade
                  .sort((a, b) => b.grade - a.grade)
                  .map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                          #{index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">
                            {user.user.username}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={"neutral"}>
                          {getGradeLabel(user.grade)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              user.grade >= 90
                                ? "bg-green-500"
                                : user.grade >= 80
                                ? "bg-blue-500"
                                : user.grade >= 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${user.grade}%` }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-lg font-bold">{user.grade}</div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </GuardedLayout>
  );
}
