"use client";

import useDebounce from "@/hooks/use-debounce";
import { trpc } from "@/utils/trpc";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTablePagination } from "@/components/datatable/data-table-pagination";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { IBank } from "@/types/bank";
import { SubjectUpdateFormOuter } from "../update/SubjectUpdateFormOuter";

export function SubjectDataTable() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(5);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    setPage(Number(searchParams.get("page")) || 1);
    setPerPage(Number(searchParams.get("perPage")) || 5);
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const debouncedSearch = useDebounce(search, 1000);

  const [selectedSubject, setSelectedSubject] = useState<IBank | null>(null);

  const { data, isLoading, refetch } = trpc.bank.getPaginated.useQuery(
    {
      page,
      perPage,
      search: debouncedSearch,
    },
    {
      refetchOnWindowFocus: false,
      placeholderData: (previousData) => previousData,
    }
  );

  if (isLoading) {
    return <div className="py-4">Wait a moment...</div>;
  }

  if (!data) return <div>No data</div>;

  const tableData: IBank[] =
    data.data.map((bank) => ({
      ...bank,
      createdAt: new Date(bank.createdAt),
      updatedAt: new Date(bank.updatedAt),
      user: {
        ...bank.user,
        createdAt: new Date(bank.user.createdAt),
        updatedAt: new Date(bank.user.updatedAt),
      },
    })) ?? [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const params = new URLSearchParams(searchParams);
    params.set("search", e.target.value);
    params.set("page", "1");
    router.push(`${pathName}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    params.set("perPage", String(perPage));
    if (search) params.set("search", search);
    router.push(`${pathName}?${params.toString()}`);
  };

  const handlePerPageChange = (newPerPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("perPage", String(newPerPage));
    params.set("page", "1");
    if (search) params.set("search", search);
    router.push(`${pathName}?${params.toString()}`);
  };

  return (
    <div className="w-sm overflow-x-auto py-10 sm:w-full">
      <DataTable
        search={search}
        columns={columns(setSelectedSubject, {
          page: data.meta.currentPage,
          perPage: data.meta.perPage,
        })}
        data={tableData}
        isLoading={isLoading}
        handleSearch={handleSearchChange}
      />

      <DataTablePagination
        currentPage={data.meta.currentPage ?? 0}
        lastPage={data.meta.lastPage ?? 0}
        perPage={data.meta.perPage ?? 0}
        totalItems={data.meta.totalItems ?? 0}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

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
