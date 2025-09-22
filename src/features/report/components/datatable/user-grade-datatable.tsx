"use client";

import useDebounce from "@/hooks/use-debounce";
import { trpc } from "@/utils/trpc";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTablePagination } from "@/components/datatable/data-table-pagination";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { IUserGrade } from "@/types/userGrade";

export function UserGradeDatatable() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(5);
  const [search, setSearch] = useState<string>("");

  const [date, setDate] = useState<Date | undefined>(undefined);

  const { data: subjects } = trpc.bank.getAll.useQuery();

  useEffect(() => {
    setPage(Number(searchParams.get("page")) || 1);
    setPerPage(Number(searchParams.get("perPage")) || 5);
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const debouncedSearch = useDebounce(search, 1000);

  const { data, isLoading } = trpc.userGrade.getPaginated.useQuery(
    {
      page,
      perPage,
      bankId: value ? Number(value) : undefined,
      createdAt: date ? date.toISOString() : undefined,
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

  const tableData: IUserGrade[] =
    data.data.map((grade) => ({
      ...grade,
      createdAt: new Date(grade.createdAt),
      updatedAt: new Date(grade.updatedAt),
      user: {
        ...grade.user,
        createdAt: new Date(grade.user.createdAt),
        updatedAt: new Date(grade.user.updatedAt),
      },
      bank: {
        ...grade.bank,
        createdAt: new Date(grade.bank.createdAt),
        updatedAt: new Date(grade.bank.updatedAt),
      },
    })) ?? [];

  const subjectsArray = [
    ...(subjects ?? []).map((subject) => ({
      label: `${subject.title} (${subject.type} - ${subject.category})`,
      value: subject.id.toString(),
    })),
  ];

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
        date={date}
        search={search}
        value={value}
        subjectsArray={subjectsArray}
        columns={columns({
          page: data.meta.currentPage,
          perPage: data.meta.perPage,
        })}
        data={tableData}
        isLoading={isLoading}
        setDate={setDate}
        setValue={setValue}
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
    </div>
  );
}
