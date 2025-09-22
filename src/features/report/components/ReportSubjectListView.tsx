"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  BookOpen,
  Calendar,
  BookMarked,
  Filter,
  X,
  UsersRound,
  CloudDownload,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DatePickerInput } from "@/components/DatePickerInput";
import { toast } from "sonner";

type CategoryFilter = "ALL" | "NORMAL" | "EMERGENCY";
type TypeFilter = "ALL" | "PG" | "EX";

export default function ReportSubjectListView() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const { data, isLoading: isLoadingSubjects } = trpc.bank.getAll.useQuery();

  const exportCSV = trpc.userGrade.exportCsv.useMutation();

  if (isLoadingSubjects) {
    return <div className="py-4">Wait a moment...</div>;
  }

  if (!data) return <div>No data</div>;

  const filteredSubjects = data.filter((subject) => {
    const matchesSearch = subject.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || subject.category === categoryFilter;
    const matchesType = typeFilter === "ALL" || subject.type === typeFilter;

    if (dateFilter) {
      const subjectDate = new Date(subject.createdAt);
      const filterDate = new Date(dateFilter);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        subjectDate.toDateString() === filterDate.toDateString()
      );
    }

    return matchesSearch && matchesCategory && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const activeFiltersCount =
    (categoryFilter !== "ALL" ? 1 : 0) +
    (typeFilter !== "ALL" ? 1 : 0) +
    (dateFilter ? 1 : 0);

  const clearFilters = () => {
    setCategoryFilter("ALL");
    setTypeFilter("ALL");
    setDateFilter(undefined);
  };

  const handleDownloadCSV = async (bankId: number) => {
    setIsLoading(true);

    try {
      const csvData = await exportCSV.mutateAsync({
        bankId: bankId,
        endDate: new Date().toISOString(),
      });

      const blob = new Blob([csvData.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", csvData.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download CSV:", error);
      toast.error("Oops, Something went wrong!", {
        description: "Try again later!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
          <Input
            placeholder="Search your subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <DatePickerInput value={dateFilter} onChange={setDateFilter} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="neutral" size="sm" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Category
                {categoryFilter !== "ALL" && (
                  <span className="ml-1 bg-main text-white text-xs rounded-full px-1.5 py-0.5">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCategoryFilter("ALL")}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("NORMAL")}>
                Normal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("EMERGENCY")}>
                Emergency
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="neutral" size="sm" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Type
                {typeFilter !== "ALL" && (
                  <span className="ml-1 bg-main text-white text-xs rounded-full px-1.5 py-0.5">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTypeFilter("ALL")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("PG")}>
                PG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("EX")}>
                EX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFiltersCount > 0 && (
            <Button variant="default" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categoryFilter !== "ALL" && (
            <div className="flex items-center gap-2 bg-white/50 border-2 px-3 py-1 rounded-full text-sm">
              <span>Category: {categoryFilter}</span>
              <button
                onClick={() => setCategoryFilter("ALL")}
                className="hover:bg-main cursor-pointer rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {typeFilter !== "ALL" && (
            <div className="flex items-center gap-2 bg-white/50 border-2 px-3 py-1 rounded-full text-sm">
              <span>Type: {typeFilter}</span>
              <button
                onClick={() => setTypeFilter("ALL")}
                className="hover:bg-main cursor-pointer rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {dateFilter?.toString() !== undefined && (
            <div className="flex items-center gap-2 bg-white/50 border-2 px-3 py-1 rounded-full text-sm">
              <span>Date: {dateFilter?.toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}</span>
              <button
                onClick={() => setDateFilter(undefined)}
                className="hover:bg-main cursor-pointer rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="bg-main/80">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    {subject.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={"neutral"}>{subject.category}</Badge>
                    <Badge variant={"neutral"}>{subject.type}</Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="neutral" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDownloadCSV(subject.id)}
                    >
                      <CloudDownload className="mr-2 h-4 w-4" />
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {subject._count.questions} subjects
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <UsersRound className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {subject._count.userGrade} students
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm mb-4">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(subject.createdAt)}</span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/reports/subject/${subject.id}`}
                  className={buttonVariants({
                    variant: "neutral",
                    className: "flex-1",
                    size: "sm",
                  })}
                >
                  <BookMarked className="mr-2 h-4 w-4" />
                  Students Grade
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
