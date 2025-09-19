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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  Users,
  BookMarked,
  Filter,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SubjectUpdateFormOuter } from "./update/SubjectUpdateFormOuter";
import { IBank } from "@/types/bank";

type CategoryFilter = "ALL" | "NORMAL" | "EMERGENCY";
type TypeFilter = "ALL" | "PG" | "EX";

export default function SubjectListView() {
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  const [selectedSubject, setSelectedSubject] = useState<IBank | null>(null);

  const { data, isLoading, refetch } = trpc.bank.getAll.useQuery();

  if (isLoading) {
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
    (categoryFilter !== "ALL" ? 1 : 0) + (typeFilter !== "ALL" ? 1 : 0);

  const clearFilters = () => {
    setCategoryFilter("ALL");
    setTypeFilter("ALL");
  };

  return (
    <div className="flex flex-col">
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
                      onClick={() => {
                        setSelectedSubject({
                          ...subject,
                          createdAt: new Date(subject.createdAt),
                          updatedAt: new Date(subject.updatedAt),
                          user: {
                            ...subject.user,
                            createdAt: new Date(subject.user.createdAt),
                            updatedAt: new Date(subject.user.updatedAt),
                          },
                        });
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Questions
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">10 Subject</span>
              </div>

              <div className="flex items-center gap-2 text-sm mb-4">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(subject.createdAt)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="neutral"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedSubject({
                      ...subject,
                      createdAt: new Date(subject.createdAt),
                      updatedAt: new Date(subject.updatedAt),
                      user: {
                        ...subject.user,
                        createdAt: new Date(subject.user.createdAt),
                        updatedAt: new Date(subject.user.updatedAt),
                      },
                    });
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant={"neutral"} size="sm" className="flex-1">
                  <BookMarked className="mr-2 h-4 w-4" />
                  Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12" strokeWidth={2.5} />
            <h3 className="mt-2 text-lg font-semibold">No subjects found</h3>
            <p className="mt-1 text-sm">
              {search || categoryFilter !== "ALL" || typeFilter !== "ALL"
                ? "Try adjusting your search or filters."
                : "You don't have any subjects yet."}
            </p>
            <div className="mt-6">
              {search || categoryFilter !== "ALL" || typeFilter !== "ALL" ? (
                <Button
                  variant="neutral"
                  onClick={() => {
                    setSearch("");
                    clearFilters();
                  }}
                >
                  Clear all filters
                </Button>
              ) : (
                <Link
                  href="/subjects/create"
                  className={buttonVariants({ variant: "neutral" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first subject
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedSubject && (
        <SubjectUpdateFormOuter
          subjectId={selectedSubject.id}
          open={!!selectedSubject}
          onClose={() => setSelectedSubject(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
